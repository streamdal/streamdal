import asyncio
import datetime
import logging
import os
import platform
import signal
import snitch_protos.protos as protos
import socket
import uuid
from betterproto import which_one_of
from .exceptions import SnitchException, SnitchRegisterException
from copy import copy
from dataclasses import dataclass, field
from grpclib.client import Channel
from .metrics import Metrics
from threading import Thread, Event
from wasmtime import Config, Engine, Linker, Module, Store, Memory, WasiConfig, Instance

DEFAULT_SNITCH_PORT = 9090
DEFAULT_SNITCH_URL = "localhost"
DEFAULT_SNITCH_TOKEN = "1234"
DEFAULT_PIPELINE_TIMEOUT = 1 / 10  # 100 milliseconds
DEFAULT_STEP_TIMEOUT = 1 / 100  # 10 milliseconds
DEFAULT_GRPC_TIMEOUT = 5  # 5 seconds
DEFAULT_HEARTBEAT_INTERVAL = 1  # 1 second
MAX_PAYLOAD_SIZE = 1024 * 1024  # 1 megabyte

MODE_CONSUMER = 1
MODE_PRODUCER = 2

CLIENT_TYPE_SDK = 1
CLIENT_TYPE_SHIM = 2


@dataclass(frozen=True)
class ProcessRequest:
    operation_type: int
    operation_name: str
    component_name: str
    data: bytes


@dataclass(frozen=True)
class ProcessResponse:
    data: bytes
    error: bool
    message: str


@dataclass(frozen=True)
class SnitchConfig:
    """SnitchConfig is a dataclass that holds configuration for the SnitchClient"""

    grpc_url: str = os.getenv("SNITCH_URL", DEFAULT_SNITCH_URL)
    grpc_port: int = os.getenv("SNITCH_PORT", DEFAULT_SNITCH_PORT)
    grpc_token: str = os.getenv("SNITCH_TOKEN", DEFAULT_SNITCH_TOKEN)
    grpc_timeout: int = os.getenv("SNITCH_GRPC_TIMEOUT", DEFAULT_GRPC_TIMEOUT)
    pipeline_timeout: int = os.getenv("SNITCH_PIPELINE_TIMEOUT", 1 / 10)
    step_timeout: int = os.getenv("SNITCH_STEP_TIMEOUT", 1 / 100)
    service_name: str = os.getenv("SNITCH_SERVICE_NAME", socket.getfqdn())
    dry_run: bool = os.getenv("SNITCH_DRY_RUN", False)
    client_type: int = CLIENT_TYPE_SDK
    exit: Event = Event()
    audiences: list = field(default_factory=list)


class SnitchClient:
    cfg: SnitchConfig
    channel: Channel
    stub: protos.InternalStub
    loop: asyncio.AbstractEventLoop
    pipelines: dict
    paused_pipelines: dict
    log: logging.Logger
    metrics: Metrics
    functions: dict
    exit: Event
    session_id: str
    grpc_timeout: int
    auth_token: str
    workers: list
    audiences: dict

    def __init__(self, cfg: SnitchConfig):
        self._validate_config(cfg)
        self.cfg = cfg

        log = logging.getLogger("snitch-client")
        log.setLevel(logging.DEBUG)

        register_loop = asyncio.new_event_loop()
        self.register_channel = Channel(
            host=cfg.grpc_url, port=cfg.grpc_port, loop=register_loop
        )
        self.register_stub = protos.InternalStub(channel=self.register_channel)
        self.register_loop = register_loop

        grpc_loop = asyncio.new_event_loop()
        self.grpc_channel = Channel(
            host=cfg.grpc_url, port=cfg.grpc_port, loop=grpc_loop
        )
        self.grpc_stub = protos.InternalStub(channel=self.grpc_channel)
        self.grpc_loop = grpc_loop

        self.auth_token = cfg.grpc_token
        self.grpc_timeout = 5
        self.pipelines = {}
        self.paused_pipelines = {}
        self.audiences = {}
        self.log = log
        self.exit = cfg.exit
        self.metrics = Metrics(
            stub=self.grpc_stub,
            log=self.log,
            exit=cfg.exit,
            loop=grpc_loop,
            auth_token=self.auth_token,
        )
        self.functions = {}
        self.session_id = uuid.uuid4().__str__()
        self.workers = []

        events = [signal.SIGINT, signal.SIGTERM, signal.SIGQUIT, signal.SIGHUP]
        for e in events:
            signal.signal(e, self.shutdown)

        # Add audiences passed on config
        for aud in self.cfg.audiences:
            self.add_audience(aud)

        # Pull initial pipelines
        self._pull_initial_pipelines()

        # Start heartbeat
        heartbeat = Thread(target=self._heartbeat, daemon=False)
        heartbeat.start()
        self.workers.append(heartbeat)

        # Run register
        register = Thread(target=self._register, daemon=False)
        register.start()
        self.workers.append(register)

        self.log.debug("Client started")

    def _pull_initial_pipelines(self):
        async def call():
            req = protos.GetAttachCommandsByServiceRequest(
                service_name=self.cfg.service_name
            )
            cmds = await self.grpc_stub.get_attach_commands_by_service(
                req, metadata=self._get_metadata()
            )

            for cmd in cmds.active:
                self._attach_pipeline(cmd)

            for cmd in cmds.paused:
                aud_str = self.aud_to_str(cmd.audience)

                if self.paused_pipelines.get(aud_str) is None:
                    self.paused_pipelines[aud_str] = {}

                self.paused_pipelines[aud_str][cmd.attach_pipeline.pipeline.id] = cmd

                self.log.debug(
                    "Adding pipeline {} to paused pipelines".format(
                        cmd.attach_pipeline.pipeline.id
                    )
                )

        self.grpc_loop.run_until_complete(call())

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

    @staticmethod
    def aud_to_str(aud: protos.Audience) -> str:
        """Convert an Audience to a string"""
        return "{}.{}.{}.{}".format(
            aud.service_name, aud.component_name, aud.operation_type, aud.operation_name
        )

    @staticmethod
    def str_to_aud(aud: str) -> protos.Audience:
        """Convert a string to an Audience"""
        parts = aud.split(".")
        return protos.Audience(
            service_name=parts[0],
            operation_type=protos.OperationType(int(parts[2])),
            operation_name=parts[3],
            component_name=parts[1],
        )

    def seen_audience(self, aud: protos.Audience) -> bool:
        """Have we seen this audience before?"""
        return self.audiences.get(self.aud_to_str(aud)) is not None

    def add_audience(self, aud: protos.Audience) -> None:
        """Add an audience to the local map and send to snitch-server"""
        if self.seen_audience(aud):
            return

        async def call():
            req = protos.NewAudienceRequest(audience=aud, session_id=self.session_id)
            await self.grpc_stub.new_audience(
                req, timeout=self.grpc_timeout, metadata=self._get_metadata()
            )

        # We haven't seen it yet, add to local map and send to snitch-server
        self.audiences[self.aud_to_str(aud)] = aud
        self.grpc_loop.run_until_complete(call())

    def process(self, req: ProcessRequest) -> ProcessResponse:
        """Apply pipelines to a component+operation"""
        if req is None:
            raise ValueError("req is required")

        payload_size = len(req.data)  # No need to compute this multiple times

        aud = protos.Audience(
            service_name=self.cfg.service_name,
            operation_type=protos.OperationType(req.operation_type),
            operation_name=req.operation_name,
            component_name=req.component_name,
        )

        labels = {
            "service": self.cfg.service_name,
            "component_name": req.component_name,
            "operation_name": req.operation_name,
            "pipeline_name": "",
            "pipeline_id": "",
        }

        if payload_size > MAX_PAYLOAD_SIZE:
            self.metrics.incr(
                metrics.CounterEntry(
                    name=metrics.COUNTER_PRODUCE_ERRORS,
                    value=1.0,
                    labels=labels,
                )
            )
            return ProcessResponse(data=req.data, error=False, message="")

        bytes_counter = metrics.COUNTER_CONSUME_BYTES
        errors_counter = metrics.COUNTER_CONSUME_ERRORS
        total_counter = metrics.COUNTER_CONSUME_PROCESSED
        if req.operation_type == MODE_PRODUCER:
            bytes_counter = metrics.COUNTER_PRODUCE_BYTES
            errors_counter = metrics.COUNTER_PRODUCE_ERRORS
            total_counter = metrics.COUNTER_PRODUCE_PROCESSED

        # Ensure no side-effects are propagated to outside the library
        data = copy(req.data)

        # Get rules based on operation and component
        pipelines = self._get_pipelines(aud)

        for _, cmd in pipelines.items():
            pipeline = cmd.attach_pipeline.pipeline
            self.log.debug("Running pipeline '{}'".format(pipeline.name))

            labels["pipeline_id"] = pipeline.id
            labels["pipeline_name"] = pipeline.name

            self.metrics.incr(
                metrics.CounterEntry(name=total_counter, value=1.0, labels=labels)
            )

            self.metrics.incr(
                metrics.CounterEntry(
                    name=bytes_counter, value=payload_size, labels=labels
                )
            )

            for step in pipeline.steps:
                # Exec wasm
                wasm_resp = self._call_wasm(step, data)

                if self.cfg.dry_run:
                    self.log.debug(
                        "Running step '{}' in dry-run mode".format(step.name)
                    )

                # If successful, continue to next step, don't need to check conditions
                if wasm_resp.exit_code == protos.WasmExitCode.WASM_EXIT_CODE_SUCCESS:
                    data = wasm_resp.output

                    if self.cfg.dry_run:
                        self.log.debug(
                            "Step '{}' succeeded, continuing to next step".format(
                                step.name
                            )
                        )
                        continue

                    should_continue = True
                    for cond in step.on_success:
                        if (
                            cond
                            == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_NOTIFY
                        ):
                            self._notify_condition(pipeline, step, cmd.audience)
                            self.log.debug(
                                "Step '{}' succeeded, notifying".format(step.name)
                            )
                        elif (
                            cond
                            == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_ABORT
                        ):
                            should_continue = False
                            self.log.debug(
                                "Step '{}' succeeded, aborting".format(step.name)
                            )
                        else:
                            # We still need to continue to remaining steps after other conditions have been processed
                            self.log.debug(
                                "Step '{}' succeeded, continuing to next step".format(
                                    step.name
                                )
                            )

                    # Not continuing, exit function early
                    if should_continue is False and self.cfg.dry_run is False:
                        return ProcessResponse(
                            data=data, error=True, message=wasm_resp.exit_msg
                        )

                    continue

                should_continue = True
                for cond in step.on_failure:
                    if (
                        cond
                        == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_NOTIFY
                    ):
                        self._notify_condition(pipeline, step, cmd.audience)
                        self.log.debug("Step '{}' failed, notifying".format(step.name))
                    elif (
                        cond
                        == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_ABORT
                    ):
                        should_continue = False
                        self.log.debug(
                            "Step '{}' failed, aborting further pipeline steps".format(
                                step.name
                            )
                        )
                    else:
                        # We still need to continue to remaining steps after other conditions have been processed
                        self.log.debug(
                            "Step '{}' failed, continuing to next step".format(
                                step.name
                            )
                        )

                # Not continuing, exit function early
                if should_continue is False and self.cfg.dry_run is False:
                    return ProcessResponse(
                        data=data, error=True, message=wasm_resp.exit_msg
                    )

        # The value of data will be modified each step above regardless of dry run, so that pipelines
        # can execute as expected. This is why we need to reset to the original data here.
        if self.cfg.dry_run:
            data = req.data

        return ProcessResponse(data=data, error=False, message="")

    def _notify_condition(
        self, pipeline: protos.Pipeline, step: protos.PipelineStep, aud: protos.Audience
    ):
        async def call():
            self.metrics.incr(
                metrics.CounterEntry(
                    name=metrics.COUNTER_NOTIFY,
                    value=1.0,
                    labels={
                        "service": self.cfg.service_name,
                        "component_name": aud.component_name,
                        "pipeline_name": pipeline.name,
                        "pipeline_id": pipeline.id,
                        "operation_name": aud.operation_name,
                    },
                )
            )

            req = protos.NotifyRequest(
                pipeline_id=pipeline.id,
                audience=aud,
                step_name=step.name,
                occurred_at_unix_ts_utc=int(datetime.datetime.utcnow().timestamp()),
            )

            await self.grpc_stub.notify(
                req, timeout=self.grpc_timeout, metadata=self._get_metadata()
            )

        self.log.debug("Notifying")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        if not self.cfg.dry_run:
            loop.run_until_complete(call())

    def _get_pipelines(self, aud: protos.Audience) -> dict:
        """
        Get pipelines for a given mode and operation

        :return: dict of pipelines in format dict[str:protos.Command]
        """
        aud_str = self.aud_to_str(aud)

        pipelines = self.pipelines.get(aud_str)
        if pipelines is None:
            return {}

        return pipelines

    def _get_metadata(self) -> dict:
        """Returns map of metadata needed for gRPC calls"""
        return {"auth-token": self.auth_token}

    def shutdown(self, *args):
        """Shutdown the service"""
        self.log.debug("called shutdown()")
        self.exit.set()
        self.metrics.shutdown(args)

        for worker in self.workers:
            self.log.debug("Waiting for worker {} to exit".format(worker.name))
            try:
                if worker.is_alive():
                    worker.join()
            except RuntimeError as e:
                self.log.error("Could not exit worker {}".format(worker.name))
                continue

        self.grpc_channel.close()
        self.register_channel.close()
        self.log.debug("exited shutdown()")

    def _heartbeat(self):
        async def call():
            req = protos.HeartbeatRequest(
                session_id=self.session_id,
            )

            return await self.grpc_stub.heartbeat(
                req, timeout=self.grpc_timeout, metadata=self._get_metadata()
            )

        asyncio.set_event_loop(self.grpc_loop)
        while not self.exit.is_set():
            self.grpc_loop.run_until_complete(call())
            self.exit.wait(DEFAULT_HEARTBEAT_INTERVAL)

        # Wait for all pending tasks to complete before exiting thread, to avoid exception
        self.grpc_loop.run_until_complete(
            asyncio.gather(*asyncio.all_tasks(self.grpc_loop))
        )

        self.grpc_channel.close()
        self.log.debug("Heartbeat thread exiting")

    def _register(self) -> None:
        """Register the service with the Snitch Server and receive a stream of commands to execute"""
        req = protos.RegisterRequest(
            dry_run=self.cfg.dry_run,
            service_name=self.cfg.service_name,
            session_id=self.session_id,
            client_info=protos.ClientInfo(
                client_type=protos.ClientType(self.cfg.client_type),
                library_name="snitch-python-client",
                library_version="0.0.0",
                language="python",
                arch=platform.processor(),
                os=platform.system(),
            ),
        )

        async def call():
            self.log.debug("Registering with snitch server")

            async for cmd in self.register_stub.register(
                req, timeout=None, metadata=self._get_metadata()
            ):
                if self.exit.is_set():
                    return

                self.log.debug("received command: {}".format(cmd))

                (command, _) = which_one_of(cmd, "command")

                if command == "attach_pipeline":
                    self._attach_pipeline(cmd)
                elif command == "detach_pipeline":
                    self._detach_pipeline(cmd)
                elif command == "pause_pipeline":
                    self._pause_pipeline(cmd)
                elif command == "resume_pipeline":
                    self._resume_pipeline(cmd)
                elif command == "keep_alive":
                    print("keep alive")
                else:
                    self.log.error("Unknown response type: {}".format(cmd))

        self.log.debug("Starting register looper")
        asyncio.set_event_loop(self.register_loop)
        self.cancel_task = self.register_loop.create_task(call())
        self.register_loop.run_until_complete(self.cancel_task)

        # Wait for all pending tasks to complete before exiting thread, to avoid exception
        self.register_loop.run_until_complete(
            asyncio.gather(*asyncio.all_tasks(self.register_loop))
        )

        # Cleanup gRPC connections
        self.register_channel.close()
        self.register_loop.stop()

        self.log.debug("Exited register looper")

    @staticmethod
    def _put_pipeline(pipes_map: dict, cmd: protos.Command, pipeline_id: str) -> None:
        """Set pipeline in internal map of pipelines"""
        aud_str = SnitchClient.aud_to_str(cmd.audience)

        # Create audience key if it doesn't exist
        if pipes_map.get(aud_str) is None:
            pipes_map[aud_str] = {}

        pipes_map[aud_str][pipeline_id] = cmd

    @staticmethod
    def _pop_pipeline(
        pipes_map: dict, cmd: protos.Command, pipeline_id: str
    ) -> protos.Command:
        """Grab pipeline in internal map of pipelines and remove it"""
        aud_str = SnitchClient.aud_to_str(cmd.audience)

        if pipes_map.get(aud_str) is None:
            return None

        if pipes_map[aud_str].get(pipeline_id) is None:
            return None

        pipeline = pipes_map[aud_str][pipeline_id]

        del pipes_map[aud_str][pipeline_id]
        if len(pipes_map[aud_str]) == 0:
            del pipes_map[aud_str]

        return pipeline

    def _detach_pipeline(self, cmd: protos.Command) -> bool:
        """Delete pipeline from internal map of pipelines"""
        if cmd is None:
            raise ValueError("Command is None")

        if cmd.audience.operation_type == protos.OperationType.OPERATION_TYPE_UNSET:
            raise ValueError("Operation type not set")

        if cmd.audience.service_name != self.cfg.service_name:
            self.log.debug("Service name does not match, ignoring")
            return False

        aud_str = self.aud_to_str(cmd.audience)

        self.log.debug(
            "Deleting pipeline {} for audience {}".format(
                cmd.detach_pipeline.pipeline_id, aud_str
            )
        )

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
            self.log.debug(
                "Pipeline {} is paused, updating in paused list".format(pipeline_id)
            )
            self._put_pipeline(self.paused_pipelines, cmd, pipeline_id)
        else:
            self.log.debug(
                "Pipeline {} is not paused, updating in active list".format(pipeline_id)
            )
            self._put_pipeline(self.pipelines, cmd, pipeline_id)

        return True

    def _pause_pipeline(self, cmd: protos.Command) -> bool:
        """Pauses execution of a specified pipeline"""
        if cmd is None:
            raise ValueError("Command is None")

        if cmd.audience.operation_type == protos.OperationType.OPERATION_TYPE_UNSET:
            raise ValueError("Operation type not set")

        if cmd.audience.service_name != self.cfg.service_name:
            self.log.debug("Service name does not match, ignoring")
            return False

        # Remove from pipelines and add to paused pipelines
        pipeline = self._pop_pipeline(
            self.pipelines, cmd, cmd.pause_pipeline.pipeline_id
        )

        self._put_pipeline(
            self.paused_pipelines, pipeline, cmd.pause_pipeline.pipeline_id
        )

        return True

    def _resume_pipeline(self, cmd: protos.Command) -> bool:
        """Resumes execution of a specified pipeline"""

        if cmd is None:
            raise ValueError("Command is None")

        if cmd.audience.operation_type == protos.OperationType.OPERATION_TYPE_UNSET:
            raise ValueError("Operation type not set")

        if cmd.audience.service_name != self.cfg.service_name:
            self.log.debug("Service name does not match, ignoring")
            return False

        if not self._is_paused(cmd.audience, cmd.resume_pipeline.pipeline_id):
            return False

        # Remove from paused pipelines and add to pipelines
        pipeline = self._pop_pipeline(
            self.paused_pipelines, cmd, cmd.resume_pipeline.pipeline_id
        )
        self._put_pipeline(self.pipelines, pipeline, cmd.resume_pipeline.pipeline_id)

        self.log.debug(
            "Resuming pipeline {} for audience {}".format(
                cmd.resume_pipeline.pipeline_id, cmd.audience.service_name
            )
        )

        return True

    def _is_paused(self, aud: protos.Audience, pipeline_id: str) -> bool:
        """Check if a pipeline is paused"""
        aud_str = self.aud_to_str(aud)

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
        # memory.grow(store, 14)  # Set memory limit to 1MB

        # Get alloc() from module
        alloc = instance.exports(store)["alloc"]
        # Allocate enough memory for the length of the data and receive memory pointer
        start_ptr = alloc(store, len(data) + 64)

        # Write to memory starting at pointer returned bys alloc()
        memory.write(store, data, start_ptr)

        # Execute the function
        f = instance.exports(store)[req.step.wasm_function]
        result_ptr = f(store, start_ptr, len(data))

        # Read from result pointer
        return self._read_memory(memory, store, result_ptr)

    @staticmethod
    def _read_memory(
        memory: Memory, store: Store, result_ptr: int, length: int = -1
    ) -> bytes:
        mem_len = memory.data_len(store)

        # Ensure we aren't reading out of bounds
        if result_ptr > mem_len or result_ptr + length > mem_len:
            raise SnitchException("WASM memory pointer out of bounds")

        # TODO: can we avoid reading the entire buffer somehow?
        result_data = memory.read(store, result_ptr, mem_len)

        res = bytearray()  # Used to build our result
        nulls = 0  # How many null pointers we've encountered
        count = (
            0  # How many bytes we've read, used to check against length, if provided
        )

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
            nulls = (
                0  # Reset nulls since we read another byte and thus aren't at the end
            )

        if count == len(result_data) and nulls != 3:
            raise SnitchException(
                "unable to read response from wasm - no terminators found in response data"
            )

        return bytes(res).rstrip(b"\xa6")

    @staticmethod
    def op_to_string(op: protos.OperationType) -> str:
        if op == protos.OperationType.OPERATION_TYPE_PRODUCER:
            return "producer"

        return "consumer"
