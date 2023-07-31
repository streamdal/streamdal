import asyncio
import datetime
import logging
import os
import platform
import signal
import snitch_protos.protos as protos
import socket
import uuid
from .exceptions import SnitchException, SnitchRegisterException
from copy import copy
from dataclasses import dataclass
from grpclib.client import Channel
from .metrics import Metrics
from threading import Thread, Event
from wasmtime import Config, Engine, Linker, Module, Store, Memory, WasiConfig, Instance

DEFAULT_SNITCH_PORT = 9090
DEFAULT_SNITCH_URL = "localhost"
DEFAULT_SNITCH_TOKEN = "1234"
DEFAULT_PIPELINE_TIMEOUT = 1/10  # 100 milliseconds
DEFAULT_STEP_TIMEOUT = 1/100  # 10 milliseconds
DEFAULT_GRPC_TIMEOUT = 5  # 5 seconds
DEFAULT_HEARTBEAT_INTERVAL = 1  # 1 second
MAX_PAYLOAD_SIZE = 1024 * 1024  # 1 megabyte

MODE_CONSUMER = 1
MODE_PRODUCER = 2

CLIENT_TYPE_SDK = 1
CLIENT_TYPE_SHIM = 2


@dataclass(frozen=True)
class SnitchRequest:
    name: str
    operation: int
    component: str
    data: bytes


@dataclass(frozen=True)
class SnitchResponse:
    data: bytes
    error: bool
    message: str


@dataclass(frozen=True)
class SnitchConfig:
    """SnitchConfig is a dataclass that holds configuration for the SnitchClient"""
    grpc_url: str = os.getenv("SNITCH_URL", DEFAULT_SNITCH_URL)
    grpc_port: int = os.getenv("SNITCH_PORT", DEFAULT_SNITCH_PORT)
    grpc_token: str = os.getenv("SNITCH_TOKEN", DEFAULT_SNITCH_TOKEN)
    grpc_timeout: int = os.getenv("SNITCH_TIMEOUT", DEFAULT_GRPC_TIMEOUT)
    pipeline_timeout: int = os.getenv("SNITCH_PIPELINE_TIMEOUT", 1/10)
    step_timeout: int = os.getenv("SNITCH_STEP_TIMEOUT", 1/100)
    service_name: str = os.getenv("SNITCH_SERVICE_NAME", socket.getfqdn())
    dry_run: bool = os.getenv("SNITCH_DRY_RUN", False)
    client_type: int = CLIENT_TYPE_SDK


class SnitchClient:
    cfg: SnitchConfig
    channel: Channel
    stub: protos.InternalStub
    loop: asyncio.AbstractEventLoop
    pipelines: dict
    paused_pipelines: dict
    log: logging.Logger
    metrics: Metrics
    functions: dict[str, (Instance, Store)]
    exit: Event
    session_id: str

    def __init__(self, cfg: SnitchConfig):
        self._validate_config(cfg)
        self.cfg = cfg

        channel = Channel(host=cfg.grpc_url, port=cfg.grpc_port)
        self.channel = channel
        self.stub = protos.InternalStub(channel=self.channel)
        self.auth_token = cfg.grpc_token
        self.loop = asyncio.get_event_loop()
        self.grpc_timeout = 5
        self.pipelines = {}
        self.paused_pipelines = {}
        self.log = logging.getLogger("snitch-client")
        self.exit = Event()
        self.metrics = Metrics(stub=self.stub, log=self.log, event=self.exit)
        self.functions = {}
        self.session_id = uuid.uuid4().__str__()

        events = [signal.SIGINT, signal.SIGTERM, signal.SIGQUIT, signal.SIGHUP]
        for e in events:
            signal.signal(e, self.shutdown)

        # Run register
        register = Thread(target=self._register)
        register.start()

        # Start heartbeat
        heartbeat = Thread(target=self._heartbeat)
        heartbeat.start()

        # TODO: figure out joins

    @staticmethod
    def _validate_config(cfg: SnitchConfig) -> None:
        if cfg is None:
            raise ValueError("cfg is required")
        elif cfg.service_name == "":
            raise ValueError("service_name is required")
        elif cfg.grpc_url == "":
            raise ValueError("grpc_url is required")
        elif cfg.grpc_port == 0:
            raise ValueError("grpc_port is required")
        elif cfg.grpc_token == "":
            raise ValueError("grpc_token is required")

    def process(self, req: SnitchRequest) -> SnitchResponse:
        """Apply pipelines to a component+operation"""
        if req is None:
            raise ValueError("req is required")

        # Ensure no side-effects are propagated to outside the library
        data = copy(req.data)

        # Get rules based on operation and component
        pipelines = self._get_pipelines(req.operation, req.component)

        for k, cmd in pipelines:
            pipeline = cmd.attatch_pipeline
            self.log.debug("Running pipeline '{}'".format(pipeline.name))

            for step in pipeline.steps:
                # Exec wasm
                wasm_resp = self._call_wasm(step, data)

                if self.cfg.dry_run:
                    self.log.debug("Running step '{}' in dry-run mode".format(step.name))

                # If successful, continue to next step, don't need to check conditions
                if wasm_resp.exit_code == protos.WasmExitCode.WASM_EXIT_CODE_SUCCESS:
                    data = wasm_resp.output

                    if self.cfg.dry_run:
                        self.log.debug("Step '{}' succeeded, continuing to next step".format(step.name))
                        continue

                    should_continue = True
                    for cond in step.on_success:
                        if cond == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_NOTIFY:
                            self._notify_condition(pipeline, step, cmd.audience)
                            self.log.debug("Step '{}' succeeded, notifying".format(step.name))
                        elif cond == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_ABORT:
                            should_continue = False
                            self.log.debug("Step '{}' succeeded, aborting".format(step.name))
                        else:
                            # We still need to continue to remaining pipeline steps after other conditions have been processed
                            self.log.debug("Step '{}' succeeded, continuing to next step".format(step.name))

                        # Not continuing, exit function early
                        if should_continue is False and self.cfg.dry_run is False:
                            return SnitchResponse(data=data, error=True, message=wasm_resp.exit_msg)

                    continue

                should_continue = True
                for cond in step.on_failure:
                    if cond == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_NOTIFY:
                        self._notify_condition(pipeline, step, cmd.audience)
                        self.log.debug("Step '{}' failed, notifying".format(step.name))
                    elif cond == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_ABORT:
                        should_continue = False
                        self.log.debug("Step '{}' failed, aborting".format(step.name))
                    else:
                        # We still need to continue to remaining pipeline steps after other conditions have been processed
                        self.log.debug("Step '{}' failed, continuing to next step".format(step.name))

                    # Not continuing, exit function early
                    if should_continue is False and self.cfg.dry_run is False:
                        return SnitchResponse(data=data, error=True, message=wasm_resp.exit_msg)

        # The value of data will be modified each step above regardless of dry run, so that pipelines
        # can execute as expected. This is why we need to reset to the original data here.
        if self.cfg.dry_run:
            data = req.data

        return SnitchResponse(data=data, error=False, message="")

    def _notify_condition(self, pipeline: protos.Pipeline, step: protos.PipelineStep, aud: protos.Audience):
        async def call():
            req = protos.NotifyRequest()
            req.pipeline_id = pipeline.id
            req.audience = aud
            req.metadata = {}
            req.step_name = step.name
            req.occurred_at_unix_ts_utc = int(datetime.datetime.utcnow().timestamp())

            await self.stub.notify(req, timeout=self.grpc_timeout, metadata=self._get_metadata())

        self.log.debug("Notifying")
        if not self.cfg.dry_run:
            self.loop.run_until_complete(call())

    def _get_pipelines(self, mode: int, op: str) -> dict[str:protos.Command] | None:
        aud_str = "{}:{}".format(mode, op)

        if self.pipelines.get(aud_str) is None:
            return None

        return self.pipelines.get(aud_str)

    def _run_heartbeat(self):
        async def call():
            self.log.debug("Sending heartbeat")
            await self.stub.heartbeat(protos.HeartbeatRequest(), timeout=self.grpc_timeout, metadata=self._get_metadata())

        while not self.exit.is_set():
            self.loop.run_until_complete(call())

    def _get_metadata(self) -> dict:
        """Returns map of metadata needed for gRPC calls"""
        return {"auth-token": self.auth_token}

    def close(self) -> None:
        """Close the connection to the Snitch Server"""
        self.log.debug("Closing gRPC connection")
        self.channel.close()

    def shutdown(self, *args):
        self.exit.set()

    def _heartbeat(self):
        async def call():
            self.log.debug("Sending heartbeat")
            req = protos.HeartbeatRequest()
            req.service_name = self.cfg.service_name

            await self.stub.heartbeat(req, timeout=self.grpc_timeout, metadata=self._get_metadata())

        while True:
            self.exit.wait(DEFAULT_HEARTBEAT_INTERVAL)
            self.loop.run_until_complete(call())

    def _register(self) -> None:
        """Register the service with the Snitch Server and receive a stream of commands to execute"""
        async def call():
            self.log.debug("Registering with snitch server")

            req = protos.RegisterRequest()
            req.dry_run = self.cfg.dry_run
            req.service_name = self.cfg.service_name
            req.client_info = protos.ClientInfo(
                client_type=protos.ClientType(self.cfg.client_type),  # TODO: this needs to be passed in config
                library_name="snitch-python-client",
                library_version="0.0.1",  # TODO: how to inject via github CI?
                language="python",
                arch=platform.processor(),
                os=platform.system()
            )

            async for r in self.stub.register(req, timeout=self.grpc_timeout, metadata=self._get_metadata()):
                print("Received command: ", r)
                if r.keep_alive is not None:
                    self.log.debug("Received keep alive")  # TODO: remove logging after testing
                    pass
                elif r.set_pipeline is not None:
                    self._attach_pipeline(r)
                elif r.detatch_pipeline is not None:
                    self._detatch_pipeline(r)
                elif r.pause_pipeline is not None:
                    self._pause_pipeline(r)
                elif r.unpause_pipeline is not None:
                    self._unpause_pipeline(r)
                else:
                    raise SnitchException("Unknown response type: {}".format(r))

        self.log.debug("Starting register looper")

        try:
            self.loop.run_until_complete(call())
            self.log.debug("Register looper completed, closing connection")
        except Exception as e:
            self.channel.close()
            raise SnitchRegisterException("Failed to register: {}".format(e))

    @staticmethod
    def _put_pipeline(pipes_map: dict, cmd: protos.Command, pipeline_id: str) -> None:
        """Set pipeline in internal map of pipelines"""
        aud_str = SnitchClient.audience(cmd.audience)

        # Create audience key if it doesn't exist
        if pipes_map.get(aud_str) is None:
            pipes_map[aud_str] = {}

        pipes_map[aud_str][pipeline_id] = cmd

    @staticmethod
    def _pop_pipeline(pipes_map: dict, cmd: protos.Command, pipeline_id: str) -> protos.Command | None:
        """Grab pipeline in internal map of pipelines and remove it"""
        aud_str = SnitchClient.audience(cmd.audience)

        if pipes_map.get(aud_str) is None:
            return None

        if pipes_map[aud_str].get(pipeline_id) is None:
            return None

        pipeline = pipes_map[aud_str][pipeline_id]

        del pipes_map[aud_str][pipeline_id]
        if len(pipes_map[aud_str]) == 0:
            del pipes_map[aud_str]

        return pipeline

    def _detatch_pipeline(self, cmd: protos.Command) -> bool:
        """Delete pipeline from internal map of pipelines"""
        if cmd is None:
            raise ValueError("Command is None")

        if cmd.audience.operation_type == protos.OperationType.OPERATION_TYPE_UNSET:
            raise ValueError("Operation type not set")

        if cmd.audience.service_name != self.cfg.service_name:
            self.log.debug("Service name does not match, ignoring")
            return False

        aud_str = SnitchClient.audience(cmd.audience)

        self.log.debug("Deleting pipeline {} for audience {}".format(cmd.detach_pipeline.pipeline_id, aud_str))

        # Delete from all maps
        self._pop_pipeline(self.pipelines, cmd, cmd.detach_pipeline.pipeline_id)
        self._pop_pipeline(self.paused_pipelines, cmd, cmd.detach_pipeline.pipeline_id)

        return True

    def _attach_pipeline(self, cmd: protos.Command) -> bool:
        """
        Put pipeline in internal map of pipelines

        If the pipeline is paused, the paused map will be updated, otherwise active will
        This is to ensure pauses/resumes are explicit
        """

        pipeline_id = cmd.attach_pipeline.pipeline.id

        if self._is_paused(cmd.audience, pipeline_id):
            self.log.debug("Pipeline {} is paused, updating in paused list".format(pipeline_id))
            self._put_pipeline(self.paused_pipelines, cmd, pipeline_id)
        else:
            self.log.debug("Pipeline {} is not paused, updating in active list".format(pipeline_id))
            self._put_pipeline(self.pipelines, cmd, pipeline_id)

        return True

    def _pause_pipeline(self, cmd: protos.Command) -> bool:
        """Pauses execution of a specified pipeline"""
        if cmd is None:
            self.log.error("Command is None")
            return False

        if cmd.audience.operation_type == protos.OperationType.OPERATION_TYPE_UNSET:
            self.log.error("Operation type not set")
            return False

        if cmd.audience.service_name != self.cfg.service_name:
            self.log.debug("Service name does not match, ignoring")
            return False

        # Remove from pipelines and add to paused pipelines
        pipeline = self._pop_pipeline(self.pipelines, cmd, cmd.pause_pipeline.pipeline_id)

        self._put_pipeline(self.paused_pipelines, pipeline, cmd.pause_pipeline.pipeline_id)

        return True

    def _unpause_pipeline(self, cmd: protos.Command) -> None:
        """Resumes execution of a specified pipeline"""

        if cmd is None:
            self.log.error("Command is None")
            return

        if cmd.audience.operation_type == protos.OperationType.OPERATION_TYPE_UNSET:
            self.log.error("Operation type not set")
            return

        if cmd.audience.service_name != self.cfg.service_name:
            self.log.debug("Service name does not match, ignoring")
            return

        if not self._is_paused(cmd.audience, cmd.unpause_pipeline.id):
            return

        # Remove from paused pipelines and add to pipelines
        pipeline = self._pop_pipeline(self.paused_pipelines, cmd, cmd.unpause_pipeline.id)
        self._put_pipeline(self.pipelines, pipeline, cmd.unpause_pipeline.id)

        self.log.debug("Resuming pipeline {} for audience {}".format(cmd.unpause_pipeline.id, cmd.audience.service_name))

    def _is_paused(self, aud: protos.Audience, pipeline_id: str) -> bool:
        """Check if a pipeline is paused"""
        aud_str = SnitchClient.audience(aud)

        if self.paused_pipelines.get(aud_str) is None:
            return False

        return self.paused_pipelines[aud_str].get(pipeline_id) is not None

    def _call_wasm(self, step: protos.PipelineStep, data: bytes) -> protos.WasmResponse:
        try:
            req = protos.WasmRequest()
            req.input = copy(data)
            req.step = copy(step)

            response_bytes = self._exec_wasm(req)

            # Unmarshal WASM response
            return protos.WasmResponse().parse(response_bytes)
        except Exception as e:
            resp = protos.WasmResponse()
            resp.output = ""
            resp.exit_msg = "Failed to execute WASM: {}".format(e)
            resp.exit_code = protos.WasmExitCode.WASM_EXIT_CODE_INTERNAL_ERROR

            return resp

    def _get_function(self, step: protos.PipelineStep) -> (Instance, Store):
        """Get a function from the internal map of functions"""
        if self.functions.get(step.wasm_id) is not None:
            return self.functions[step.wasm_id]

        # Function not instantiated yet
        cfg = Config()
        engine = Engine(cfg)

        linker = Linker(engine)
        linker.define_wasi()

        module = Module(linker.engine, wasm=step.wasm_bytes)

        wasi = WasiConfig()
        wasi.inherit_stdout()
        wasi.inherit_stdin()
        wasi.inherit_stderr()

        store = Store(linker.engine)
        store.set_wasi(wasi)

        instance = linker.instantiate(store, module)

        self.functions[step.wasm_id] = (instance, store)
        return instance, store

    def _exec_wasm(self, req: protos.WasmRequest) -> bytes:
        try:
            instance, store = self._get_function(req.step)
        except Exception as e:
            raise SnitchException("Failed to instantiate function: {}".format(e))

        req = copy(req)
        req.step.wasm_bytes = None  # Don't need to write this

        data = bytes(req)

        # Get memory from module
        memory = instance.exports(store)["memory"]
        #memory.grow(store, 14)  # Set memory limit to 1MB

        # Get alloc() from module
        alloc = instance.exports(store)["alloc"]
        # Allocate enough memory for the length of the data and receive memory pointer
        start_ptr = alloc(store, len(data)+64)

        # Write to memory starting at pointer returned bys alloc()
        memory.write(store, data, start_ptr)

        # Execute the function
        f = instance.exports(store)[req.step.wasm_function]
        result_ptr = f(store, start_ptr, len(data))

        # Read from result pointer
        return self._read_memory(memory, store, result_ptr)

    @staticmethod
    def _read_memory(memory: Memory, store: Store, result_ptr: int, length: int = -1) -> bytes:
        mem_len = memory.data_len(store)

        # Ensure we aren't reading out of bounds
        if result_ptr > mem_len or result_ptr + length > mem_len:
            raise SnitchException("WASM memory pointer out of bounds")

        # TODO: can we avoid reading the entire buffer somehow?
        result_data = memory.read(store, result_ptr, mem_len)

        res = bytearray()  # Used to build our result
        nulls = 0  # How many null pointers we've encountered
        count = 0  # How many bytes we've read, used to check against length, if provided

        for v in result_data:
            if length == count and length != -1:
                break

            if nulls == 3:
                break

            if v == 166:
                nulls += 1
                res.append(v)
                continue

            count += 1
            res.append(v)
            nulls = 0  # Reset nulls since we read another byte and thus aren't at the end

        if count == len(result_data) and nulls != 3:
            raise SnitchException("unable to read response from wasm - no terminators found in response data")

        return bytes(res).rstrip(b'\xa6')

    @staticmethod
    def audience(aud: protos.Audience) -> str:
        return "{}-{}".format(aud.operation_type, aud.component_name)