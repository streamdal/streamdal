import asyncio
import streamdal.common
import datetime
import logging
import os
import platform
import signal
import streamdal.hostfunc as hostfunc
import streamdal_protos.protos as protos
import socket
import time
import uuid
import streamdal.validation
from betterproto import which_one_of
from copy import copy
from dataclasses import dataclass, field
from grpclib.client import Channel
from streamdal.metrics import Metrics, CounterEntry
from streamdal.tail import Tail
from streamdal.kv import KV
from streamdal_protos.protos import SdkResponse as ProcessResponse
from threading import Thread, Event
from wasmtime import (
    Config,
    Engine,
    Linker,
    Module,
    Store,
    WasiConfig,
    Instance,
    FuncType,
    ValType,
)

DEFAULT_SERVER_URL = "localhost:8082"
DEFAULT_SERVER_TOKEN = "1234"
DEFAULT_GRPC_RECONNECT_INTERVAL = 5  # 5 seconds
DEFAULT_PIPELINE_TIMEOUT = 1 / 10  # 100 milliseconds
DEFAULT_STEP_TIMEOUT = 1 / 100  # 10 milliseconds
DEFAULT_GRPC_TIMEOUT = 5  # 5 seconds
DEFAULT_HEARTBEAT_INTERVAL = 1  # 1 second
MAX_PAYLOAD_SIZE = 1024 * 1024  # 1 megabyte

OPERATION_TYPE_CONSUMER = 1
OPERATION_TYPE_PRODUCER = 2

CLIENT_TYPE_SDK = 1
CLIENT_TYPE_SHIM = 2


@dataclass(frozen=True)
class ProcessRequest:
    operation_type: int
    operation_name: str
    component_name: str
    data: bytes


@dataclass(frozen=True)
class Audience:
    """Audience is a dataclass that holds information about an audience. It is passed into the config when
    creating a new instance of StreamdalClient, in order to pre-announce audiences to the streamdal server.
    We use a dataclass here instead of the protobuf Audience in order to keep the public interface clean
    """

    operation_type: int
    operation_name: str
    component_name: str


@dataclass(frozen=True)
class StreamdalConfig:
    """StreamdalConfig is a dataclass that holds configuration for the StreamdalClient"""

    streamdal_url: str = os.getenv("STREAMDAL_SERVER_URL", DEFAULT_SERVER_URL)
    streamdal_token: str = os.getenv("STREAMDAL_SERVER_TOKEN", DEFAULT_SERVER_TOKEN)
    grpc_timeout: int = os.getenv("STREAMDAL_SERVER_GRPC_TIMEOUT", DEFAULT_GRPC_TIMEOUT)
    pipeline_timeout: int = os.getenv(
        "STREAMDAL_PIPELINE_TIMEOUT", DEFAULT_PIPELINE_TIMEOUT
    )
    step_timeout: int = os.getenv("STREAMDAL_STEP_TIMEOUT", DEFAULT_STEP_TIMEOUT)
    service_name: str = os.getenv("STREAMDAL_SERVICE_NAME", socket.getfqdn())
    dry_run: bool = os.getenv("STREAMDAL_DRY_RUN", False)
    client_type: int = CLIENT_TYPE_SDK
    exit: Event = Event()
    audiences: list = field(default_factory=list)

    def validate(self) -> None:
        if self.service_name == "":
            raise ValueError("service_name is required")
        elif self.streamdal_url == "":
            raise ValueError("streamdal_url is required")
        elif self.streamdal_token == "":
            raise ValueError("streamdal_token is required")


class StreamdalClient:
    cfg: StreamdalConfig
    pipelines: dict
    paused_pipelines: dict
    log: logging.Logger
    metrics: Metrics
    kv: KV
    functions: dict
    exit: Event
    session_id: str
    grpc_timeout: int
    auth_token: str
    workers: list
    audiences: dict
    tails: dict
    paused_tails: dict
    host: str
    port: int
    schemas: dict
    host_func: hostfunc.HostFunc

    # Due to the blocking nature of streaming calls, we need separate event loops and gRPC
    # channels for register` and tail requests. All other unary operations can use the same
    # grpc_channel and grpc_loop
    grpc_channel: Channel
    grpc_stub: protos.InternalStub
    grpc_loop: asyncio.AbstractEventLoop
    register_channel: Channel
    register_stub: protos.InternalStub
    register_loop: asyncio.AbstractEventLoop

    def __init__(self, cfg: StreamdalConfig):
        if not isinstance(cfg, StreamdalConfig):
            raise ValueError("cfg must be of type StreamdalConfig")
        else:
            cfg.validate()

        self.cfg = cfg

        log = logging.getLogger("streamdal-python-sdk")
        log.setLevel(logging.DEBUG)

        (host, port) = cfg.streamdal_url.split(":")
        self.host = host
        self.port = port

        register_loop = asyncio.new_event_loop()
        self.register_channel = Channel(
            host=self.host, port=self.port, loop=register_loop
        )
        self.register_stub = protos.InternalStub(channel=self.register_channel)
        self.register_loop = register_loop

        grpc_loop = asyncio.new_event_loop()
        self.grpc_channel = Channel(host=self.host, port=self.port, loop=grpc_loop)
        self.grpc_stub = protos.InternalStub(channel=self.grpc_channel)
        self.grpc_loop = grpc_loop

        self.auth_token = cfg.streamdal_token
        self.grpc_timeout = 5
        self.pipelines = {}
        self.paused_pipelines = {}
        self.audiences = {}
        self.tails = {}
        self.paused_tails = {}
        self.schemas = {}
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
        self.session_id = str(uuid.uuid4())
        self.workers = []
        self.kv = KV()
        self.host_func = hostfunc.HostFunc(kv=self.kv)

        events = [signal.SIGINT, signal.SIGTERM, signal.SIGQUIT, signal.SIGHUP]
        for e in events:
            signal.signal(e, self.shutdown)

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
                for step in cmd.attach_pipeline.pipeline.steps:
                    if step.wasm_id in cmds.wasm_modules:
                        step.wasm_bytes = cmds.wasm_modules[step.wasm_id]
                    else:
                        self.log.error(f"BUG: missing wasm module {step.wasm_id}")
                self._attach_pipeline(cmd)

            for cmd in cmds.paused:
                for step in cmd.attach_pipeline.pipeline.steps:
                    if step.wasm_id in cmds.wasm_modules:
                        step.wasm_bytes = cmds.wasm_modules[step.wasm_id]
                    else:
                        self.log.error(f"BUG: missing wasm module {step.wasm_id}")

                aud_str = common.aud_to_str(cmd.audience)

                if self.paused_pipelines.get(aud_str) is None:
                    self.paused_pipelines[aud_str] = {}

                self.paused_pipelines[aud_str][cmd.attach_pipeline.pipeline.id] = cmd

                self.log.debug(
                    "Adding pipeline {} to paused pipelines".format(
                        cmd.attach_pipeline.pipeline.id
                    )
                )

        self.grpc_loop.run_until_complete(call())

    def seen_audience(self, aud: protos.Audience) -> bool:
        """Have we seen this audience before?"""
        return self.audiences.get(common.aud_to_str(aud)) is not None

    def _add_audience(self, aud: protos.Audience) -> None:
        """Add an audience to the local map and send to server"""
        if self.seen_audience(aud):
            return

        async def call():
            req = protos.NewAudienceRequest(audience=aud, session_id=self.session_id)
            await self.grpc_stub.new_audience(
                req, timeout=self.grpc_timeout, metadata=self._get_metadata()
            )

        # We haven't seen it yet, add to local map and send to server
        self.audiences[common.aud_to_str(aud)] = aud
        self.grpc_loop.create_task(call())

    def _add_audiences(self) -> None:
        """This method is used to re-announce audiences after a disconnect"""

        async def call():
            try:
                req = protos.NewAudienceRequest(
                    audience=aud, session_id=self.session_id
                )
                await self.grpc_stub.new_audience(
                    req, timeout=self.grpc_timeout, metadata=self._get_metadata()
                )
            except Exception as e:
                self.log.debug(f"Failed to re-announce audience: {e}")

        for aud_str in self.audiences.keys():
            aud = common.str_to_aud(aud_str)
            self.grpc_loop.run_until_complete(call())

    def process(self, req: ProcessRequest) -> ProcessResponse:
        """Apply pipelines to a component+operation"""
        if req is None:
            raise ValueError("req is required")

        resp = protos.SdkResponse(
            data=copy(req.data),
            error=False,
            error_message="",
            pipeline_status=[],
        )

        payload_size = len(req.data)  # No need to compute this multiple times

        aud = protos.Audience(
            service_name=self.cfg.service_name,
            operation_type=protos.OperationType(req.operation_type),
            operation_name=req.operation_name,
            component_name=req.component_name,
        )
        self._add_audience(aud)

        labels = {
            "service": self.cfg.service_name,
            "component": req.component_name,
            "operation": req.operation_name,
            "pipeline_name": "",
            "pipeline_id": "",
        }

        bytes_counter = metrics.COUNTER_CONSUME_BYTES
        errors_counter = metrics.COUNTER_CONSUME_ERRORS
        total_counter = metrics.COUNTER_CONSUME_PROCESSED
        rate_bytes = metrics.COUNTER_CONSUME_BYTES_RATE
        rate_processed = metrics.COUNTER_CONSUME_PROCESSED_RATE

        if req.operation_type == OPERATION_TYPE_PRODUCER:
            bytes_counter = metrics.COUNTER_PRODUCE_BYTES
            errors_counter = metrics.COUNTER_PRODUCE_ERRORS
            total_counter = metrics.COUNTER_PRODUCE_PROCESSED
            rate_bytes = metrics.COUNTER_PRODUCE_BYTES_RATE
            rate_processed = metrics.COUNTER_PRODUCE_PROCESSED_RATE

        if payload_size > MAX_PAYLOAD_SIZE:
            self.metrics.incr(
                CounterEntry(
                    name=errors_counter,
                    value=1.0,
                    labels=labels,
                    aud=aud,
                )
            )
            return resp

        # Get rules based on operation and component
        pipelines = self._get_pipelines(aud)

        if len(pipelines) == 0:
            self._send_tail(
                aud,
                "",
                req.data,
                req.data,
            )
            return resp

        self.metrics.incr(CounterEntry(name=rate_bytes, value=1.0, labels={}, aud=aud))
        self.metrics.incr(
            CounterEntry(name=rate_processed, value=1.0, labels={}, aud=aud)
        )

        # Needed for send_tail()
        original_data = copy(req.data)

        pipes = pipelines.copy()

        for _, cmd in pipes.items():
            pipeline_status = protos.PipelineStatus(
                id=cmd.attach_pipeline.pipeline.id,
                name=cmd.attach_pipeline.pipeline.name,
                step_status=[],
            )

            pipeline = cmd.attach_pipeline.pipeline
            self.log.debug("Running pipeline '{}'".format(pipeline.name))

            labels["pipeline_id"] = pipeline.id
            labels["pipeline_name"] = pipeline.name

            self.metrics.incr(
                CounterEntry(name=total_counter, value=1.0, labels=labels, aud=aud)
            )

            self.metrics.incr(
                CounterEntry(
                    name=bytes_counter, value=payload_size, labels=labels, aud=aud
                )
            )

            for step in pipeline.steps:
                step_status = protos.StepStatus(
                    name=step.name,
                    error=False,
                    error_message="",
                    abort_status=protos.AbortStatus.ABORT_STATUS_UNSET,
                )

                # Exec wasm
                wasm_resp = self._call_wasm(step, resp.data)

                if self.cfg.dry_run:
                    self.log.debug(f"Running step '{step.name}' in dry-run mode")

                if len(wasm_resp.output_payload) > 0:
                    resp.data = wasm_resp.output_payload

                self._handle_schema(aud, step, wasm_resp)

                # If successful, continue to next step, don't need to check conditions
                if wasm_resp.exit_code == protos.WasmExitCode.WASM_EXIT_CODE_SUCCESS:
                    if self.cfg.dry_run:
                        self.log.debug(
                            f"Step '{step.name}' succeeded, continuing to next step"
                        )
                        continue

                    continue_pipeline, continue_process = self._handle_condition(
                        step.on_failure, pipeline, step, cmd.audience
                    )
                    if not continue_process:
                        # Exit function early
                        step_status.abort_status = protos.AbortStatus.ABORT_STATUS_ALL
                        pipeline_status.step_status.append(step_status)
                        resp.pipeline_status.append(pipeline_status)
                        return resp
                    if not continue_pipeline:
                        # Continue outer pipeline loop if there are additional pipelines
                        step_status.abort_status = (
                            protos.AbortStatus.ABORT_STATUS_CURRENT
                        )
                        pipeline_status.step_status.append(step_status)
                        resp.pipeline_status.append(pipeline_status)
                        break

                    continue  # Continue to next step as default

                # Failure conditions
                self.metrics.incr(
                    CounterEntry(name=errors_counter, value=1.0, labels=labels, aud=aud)
                )

                continue_pipeline, continue_process = self._handle_condition(
                    step.on_failure, pipeline, step, cmd.audience
                )

                step_status.error = True
                step_status.error_message = "Step failed: " + wasm_resp.exit_msg

                if not continue_process:
                    # Exit function early
                    resp.error = True
                    resp.error_message = step_status.error_message
                    step_status.abort_status = protos.AbortStatus.ABORT_STATUS_ALL
                    pipeline_status.step_status.append(step_status)
                    resp.pipeline_status.append(pipeline_status)
                    return resp
                if not continue_pipeline:
                    # Continue outer pipeline loop if there are additional pipelines
                    step_status.abort_status = protos.AbortStatus.ABORT_STATUS_CURRENT
                    pipeline_status.step_status.append(step_status)
                    resp.pipeline_status.append(pipeline_status)
                    break

                pipeline_status.step_status.append(step_status)

            resp.pipeline_status.append(pipeline_status)

        self._send_tail(aud, "", original_data, resp.data)

        # The value of data will be modified each step above regardless of dry run, so that pipelines
        # can execute as expected. This is why we need to reset to the original data here.
        if self.cfg.dry_run:
            resp.data = copy(req.data)

        return resp

    def _notify_condition(
        self, pipeline: protos.Pipeline, step: protos.PipelineStep, aud: protos.Audience
    ):
        async def call():
            self.metrics.incr(
                CounterEntry(
                    name=metrics.COUNTER_NOTIFY,
                    value=1.0,
                    aud=aud,
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

    def _handle_condition(
        self,
        conditions: [],
        pipeline: protos.Pipeline,
        step: protos.PipelineStep,
        aud: protos.Audience,
    ) -> (bool, bool):
        continue_pipeline = True
        continue_process = True

        for cond in conditions:
            if cond == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_NOTIFY:
                self._notify_condition(pipeline, step, aud)
                self.log.debug(f"Step '{step.name}' failed, notifying")
            elif (
                cond
                == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_ABORT_CURRENT
            ):
                continue_pipeline = False
                self.log.debug(
                    f"Step '{step.name}' failed, aborting further pipeline steps"
                )
            elif cond == protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_ABORT_ALL:
                continue_pipeline = False
                continue_process = False
                self.log.debug(
                    f"Step '{step.name}' failed, aborting further pipelines and steps"
                )
            else:
                # We still need to continue to remaining steps after other conditions have been processed
                self.log.debug(f"Step '{step.name}' failed, continuing to next step")

        return continue_pipeline, continue_process

    def _get_pipelines(self, aud: protos.Audience) -> dict:
        """
        Get pipelines for a given mode and operation

        :return: dict of pipelines in format dict[str:protos.Command]
        """
        aud_str = common.aud_to_str(aud)

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

        # Shut down tail request workers
        for tails in self.tails.values():
            for tr in tails.values():
                tr.exit.set()

        # Shut down heartbeat and register workers
        for worker in self.workers:
            self.log.debug(f"Waiting for worker {worker.name} to exit")
            try:
                if worker.is_alive():
                    worker.join()
            except RuntimeError:
                self.log.error(f"Could not exit worker {worker.name}")
                continue

        # Cleanup gRPC connections
        self.grpc_channel.close()
        self.register_channel.close()

        self.log.debug("exited shutdown()")

    def _heartbeat(self):
        async def call():
            try:
                audiences = []
                for aud in self.audiences.values():
                    audiences.append(aud)

                req = protos.HeartbeatRequest(
                    session_id=self.session_id,
                    audiences=audiences,
                    client_info=self._gen_client_info(),
                    service_name=self.cfg.service_name,
                )

                return await self.grpc_stub.heartbeat(
                    req, timeout=self.grpc_timeout, metadata=self._get_metadata()
                )
            except Exception as e:
                # Lost connection. Retry will occur in register
                self.log.debug(f"unable to send heartbeat: {e}")

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

    def _gen_client_info(self) -> protos.ClientInfo:
        return protos.ClientInfo(
            client_type=protos.ClientType(self.cfg.client_type),
            library_name="python-sdk",
            library_version="0.0.41",
            language="python",
            arch=platform.processor(),
            os=platform.system(),
        )

    def _gen_register_request(self) -> protos.RegisterRequest:
        req = protos.RegisterRequest(
            dry_run=self.cfg.dry_run,
            service_name=self.cfg.service_name,
            session_id=self.session_id,
            client_info=self._gen_client_info(),
            audiences=[],
        )

        # Add audiences passed on config
        for aud in self.cfg.audiences:
            aud = protos.Audience(
                service_name=self.cfg.service_name,
                operation_type=protos.OperationType(aud.operation_type),
                operation_name=aud.operation_name,
                component_name=aud.component_name,
            )

            # Add to register request
            req.audiences.append(aud)

            # Note in local map that we've seen this audience
            self.audiences[common.aud_to_str(aud)] = aud

        return req

    def _register(self) -> None:
        """Register the service with the Streamdal Server and receive a stream of commands to execute"""

        async def call():
            self.log.debug("Registering with streamdal server")

            async for cmd in self.register_stub.register(
                register_request=self._gen_register_request(),
                timeout=None,
                metadata=self._get_metadata(),
            ):
                if self.exit.is_set():
                    return

                try:
                    self._handle_command(cmd)
                except ValueError as e:
                    self.log.error(f"Received invalid command: {e}")

        self.log.debug("Starting register looper")
        asyncio.set_event_loop(self.register_loop)

        while not self.exit.is_set():
            try:
                self.register_loop.run_until_complete(call())
            except Exception as e:
                self.log.debug(
                    f"Register looper lost connection: {e}, retrying in {DEFAULT_GRPC_RECONNECT_INTERVAL}s..."
                )
                try:
                    # Kill all in-progress tail requests since register() will send them downstream again
                    self._stop_all_tails()

                    time.sleep(DEFAULT_GRPC_RECONNECT_INTERVAL)
                    self.register_channel = Channel(
                        host=self.host, port=self.port, loop=self.register_loop
                    )
                    self.grpc_channel = Channel(
                        host=self.host, port=self.port, loop=self.grpc_loop
                    )
                    self._add_audiences()
                except Exception as e:
                    self.log.error(f"reconnection failed: {e}")

        # Wait for all pending tasks to complete before exiting thread, to avoid exception
        self.register_loop.run_until_complete(
            asyncio.gather(*asyncio.all_tasks(self.register_loop))
        )

        # Cleanup gRPC connections
        self.register_channel.close()
        self.register_loop.stop()

        self.log.debug("Exited register looper")

    def _handle_command(self, cmd: protos.Command):
        (command, _) = which_one_of(cmd, "command")

        try:
            if command == "attach_pipeline":
                self._attach_pipeline(cmd)
            elif command == "detach_pipeline":
                self._detach_pipeline(cmd)
            elif command == "pause_pipeline":
                self._pause_pipeline(cmd)
            elif command == "resume_pipeline":
                self._resume_pipeline(cmd)
            elif command == "keep_alive":
                pass
            elif command == "tail":
                self._tail_request(cmd)
            elif command == "kv":
                self._handle_kv(cmd)
            else:
                self.log.error(f"Unknown response type: {cmd}")
        except Exception as e:
            self.log.error(f"Failed to handle '{command}' command: {e}")

    @staticmethod
    def _put_pipeline(pipes_map: dict, cmd: protos.Command, pipeline_id: str) -> None:
        """Set pipeline in internal map of pipelines"""
        aud_str = common.aud_to_str(cmd.audience)

        # Create audience key if it doesn't exist
        if pipes_map.get(aud_str) is None:
            pipes_map[aud_str] = {}

        pipes_map[aud_str][pipeline_id] = cmd

    @staticmethod
    def _pop_pipeline(
        pipes_map: dict, cmd: protos.Command, pipeline_id: str
    ) -> protos.Command:
        """Grab pipeline in internal map of pipelines and remove it"""
        aud_str = common.aud_to_str(cmd.audience)

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
        validation.detach_pipeline(cmd)

        if cmd.audience.service_name != self.cfg.service_name:
            self.log.debug("Service name does not match, ignoring")
            return False

        aud_str = common.aud_to_str(cmd.audience)

        self.log.debug(
            f"Deleting pipeline {cmd.detach_pipeline.pipeline_id} for audience {aud_str}"
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
        validation.attach_pipeline(cmd)

        pipeline_id = cmd.attach_pipeline.pipeline.id

        if self._is_paused(cmd.audience, pipeline_id):
            self.log.debug(f"Pipeline {pipeline_id} is paused, updating in paused list")
            self._put_pipeline(self.paused_pipelines, cmd, pipeline_id)
        else:
            self.log.debug(
                f"Pipeline {pipeline_id} is not paused, updating in active list"
            )
            self._put_pipeline(self.pipelines, cmd, pipeline_id)

        return True

    def _pause_pipeline(self, cmd: protos.Command) -> bool:
        """Pauses execution of a specified pipeline"""
        validation.pause_pipeline(cmd)

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
        validation.resume_pipeline(cmd)

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
            f"Resuming pipeline {cmd.resume_pipeline.pipeline_id} for audience {cmd.audience.service_name}"
        )

        return True

    def _handle_kv(self, cmd: protos.Command) -> bool:
        validation.kv_command(cmd)

        for i in cmd.kv.instructions:
            validation.kv_instruction(i)

            if i.action == protos.shared.KvAction.KV_ACTION_CREATE:
                self.kv.set(i.object.key, cmd.kv.request.value)
            elif i.action == protos.shared.KvAction.KV_ACTION_UPDATE:
                self.kv.set(i.object.key, cmd.kv.request.value)
            elif i.action == protos.shared.KvAction.KV_ACTION_DELETE:
                self.kv.delete(i.object.key)
            elif i.action == protos.shared.KvAction.KV_ACTION_DELETE_ALL:
                self.kv.purge()

        return True

    def _is_paused(self, aud: protos.Audience, pipeline_id: str) -> bool:
        """Check if a pipeline is paused"""
        aud_str = common.aud_to_str(aud)

        if self.paused_pipelines.get(aud_str) is None:
            return False

        return self.paused_pipelines[aud_str].get(pipeline_id) is not None

    def _call_wasm(self, step: protos.PipelineStep, data: bytes) -> protos.WasmResponse:
        try:
            req = protos.WasmRequest()
            req.input_payload = copy(data)
            req.step = copy(step)

            response_bytes = self._exec_wasm(req)

            # Unmarshal WASM response
            return protos.WasmResponse().parse(response_bytes)
        except Exception as e:
            resp = protos.WasmResponse()
            resp.output_payload = ""
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

        funcs = {
            "httpRequest": self.host_func.http_request,
            "kvExists": self.host_func.kv_exists,
        }

        for name, func in funcs.items():
            linker.define_func(
                "env",
                name,
                FuncType([ValType.i32(), ValType.i32()], [ValType.i64()]),
                func,
                True,
            )

        instance = linker.instantiate(store, module)

        self.functions[step.wasm_id] = (instance, store)
        return instance, store

    def _exec_wasm(self, req: protos.WasmRequest) -> bytes:
        try:
            instance, store = self._get_function(req.step)
        except Exception as e:
            raise common.StreamdalException(
                "Failed to instantiate function: {}".format(e)
            )

        req = copy(req)
        req.step.wasm_bytes = None  # Don't need to write this

        data = bytes(req)

        # Get memory from module
        memory = instance.exports(store)["memory"]
        # memory.grow(store, 14)  # Set memory limit to 1MB

        # Get alloc() from module
        alloc = instance.exports(store)["alloc"]
        # Allocate enough memory for the length of the data and receive memory pointer
        start_ptr = alloc(store, len(data))

        # Write to memory starting at pointer returned bys alloc()
        memory.write(store, data, start_ptr)

        # Execute the function
        f = instance.exports(store)[req.step.wasm_function]
        result_ptr = f(store, start_ptr, len(data))

        # Read from result pointer
        res = common.read_memory(memory, store, result_ptr, -1)

        # Dealloc result pointer
        dealloc = instance.exports(store)["dealloc"]
        dealloc(store, result_ptr, len(res))

        return res

    # ------------------------------------------------------------------------------------

    def _tail_request(self, cmd: protos.Command):
        validation.tail_request(cmd)

        if cmd.tail.request.type == protos.TailRequestType.TAIL_REQUEST_TYPE_START:
            self._start_tail(cmd)
        elif cmd.tail.request.type == protos.TailRequestType.TAIL_REQUEST_TYPE_STOP:
            self._stop_tail(cmd)
        elif cmd.tail.request.type == protos.TailRequestType.TAIL_REQUEST_TYPE_PAUSE:
            self._pause_tail(cmd)
        elif cmd.tail.request.type == protos.TailRequestType.TAIL_REQUEST_TYPE_RESUME:
            self._resume_tail(cmd)

    def _send_tail(
        self,
        aud: protos.Audience,
        pipeline_id: str,
        original_data: bytes,
        new_data: bytes,
    ):
        tails = self._get_active_tails_for_audience(aud)
        if len(tails) == 0:
            return

        for tail_id, running_tail in tails.items():
            if not running_tail.should_send():
                continue

            # Tail might not be active yet, so start it if needed
            # This can happen if the tail request came from internal.Register()
            # and we did not have the audience yet.
            if running_tail.active is False:
                running_tail.start_tail_workers()

            tr = protos.TailResponse(
                type=protos.TailResponseType.TAIL_RESPONSE_TYPE_PAYLOAD,
                tail_request_id=running_tail.request.id,
                audience=aud,
                pipeline_id=pipeline_id,
                session_id=self.session_id,
                timestamp_ns=time.time_ns(),
                original_data=original_data,
                new_data=new_data,
            )
            running_tail.queue.put_nowait(tr)

    def _start_tail(self, cmd: protos.Command):
        validation.tail_request(cmd)

        req = cmd.tail.request

        aud_str = common.aud_to_str(req.audience)

        # Do we already have this tail?
        if aud_str in self.tails:
            tails = self.tails.get(aud_str)
            if len(tails) > 0 and req.id in tails:
                self.log.debug(f"Tail '{req.id}' already exists, skipping TailCommand")
                return

        self.log.debug(f"Tailing audience: {aud_str}")

        t = Tail(
            request=req,
            log=self.log,
            exit=Event(),
            streamdal_url=self.cfg.streamdal_url,
            auth_token=self.auth_token,
            metrics=self.metrics,
            active=False,
        )

        # Check if we have this audience yet, if not, this TailCommand came from
        # internal.Register() and should only be cached for now instead of started
        if aud_str in self.audiences:
            t.start_tail_workers()

        self._set_active_tail(t)

    def _set_active_tail(self, t: Tail):
        key = common.aud_to_str(t.request.audience)

        if key not in self.tails:
            self.tails[key] = {}

        self.tails[key][t.request.id] = t

    def _set_paused_tail(self, t: Tail):
        key = common.aud_to_str(t.request.audience)

        if key not in self.paused_tails:
            self.paused_tails[key] = {}

        self.paused_tails[key][t.request.id] = t

    def _stop_tail(self, cmd: protos.Command):
        validation.tail_request(cmd)

        aud = cmd.tail.request.audience
        tail_id = cmd.tail.request.id

        tails = self._get_active_tails_for_audience(aud)
        if tail_id in tails.keys():
            self.log.debug(f"Stopping active tail: {tail_id}")
            tails[tail_id].exit.set()
            self._remove_active_tail(aud, tail_id)

        paused_tails = self._get_paused_tails_for_audience(aud)
        if tail_id in paused_tails.keys():
            self.log.debug(f"Stopping paused tail: {tail_id}")
            paused_tails[tail_id].exit.set()
            self._remove_paused_tail(aud, tail_id)

    def _stop_all_tails(self):
        """
        Stop all tail requests
        This is called when the register looper loses connection to the server
        since we will receive all TailCommands again on re-register.
        """
        audiences = self.tails.values()
        for audience in audiences:
            for t in audience.values():
                t.exit.set()
                self._remove_active_tail(t.request.audience, t.request.id)

        audiences = self.paused_tails.values()
        for audience in audiences:
            for t in audience.values():
                t.exit.set()
                self._remove_paused_tail(t.request.audience, t.request.id)

    def _pause_tail(self, cmd: protos.Command):
        # Remove from active tails
        t = self._remove_active_tail(cmd.tail.request.audience, cmd.tail.request.id)
        if t is None:
            self.log.debug(
                f"Received paused tail for unknown tail request {cmd.tail.request.id}"
            )
            return

        # Add to paused tails
        self._set_paused_tail(t)

        self.log.debug(f"Pausing tail: {cmd.tail.request.id}")

    def _resume_tail(self, cmd: protos.Command):
        # Remove from paused tails
        t = self._remove_paused_tail(cmd.tail.request.audience, cmd.tail.request.id)
        if t is None:
            self.log.debug(
                f"Received resumed tail for unknown tail request {cmd.tail.request.id}"
            )
            return

        # Add to active tails
        self._set_active_tail(t)

        self.log.debug(f"Resuming tail: {cmd.tail.request.id}")

    def _get_active_tails_for_audience(
        self,
        aud: protos.Audience,
    ) -> dict:
        key = common.aud_to_str(aud)
        if key in self.tails:
            return self.tails[key]

        return {}

    def _get_paused_tails_for_audience(
        self,
        aud: protos.Audience,
    ) -> dict:
        key = common.aud_to_str(aud)
        if key in self.paused_tails:
            return self.paused_tails[key]

        return {}

    def _remove_active_tail(self, aud: protos.Audience, tail_id: str) -> Tail:
        key = common.aud_to_str(aud)
        if key not in self.tails:
            return None

        if tail_id not in self.tails[key]:
            return None

        t = self.tails[key].pop(tail_id)

        if len(self.tails[key]) == 0:
            self.tails.pop(key)

        return t

    def _remove_paused_tail(self, aud: protos.Audience, tail_id: str) -> Tail:
        key = common.aud_to_str(aud)
        if key not in self.paused_tails:
            return None

        if tail_id not in self.paused_tails[key]:
            return None

        t = self.paused_tails[key].pop(tail_id)

        if len(self.paused_tails[key]) == 0:
            self.paused_tails.pop(key)

        return t

    def _get_schema(self, aud: protos.Audience) -> bytes:
        schema = self.schemas.get(common.aud_to_str(aud))
        if schema is None:
            return b""

        return schema.json_schema

    def _set_schema(self, aud: protos.Audience, schema: bytes) -> None:
        self.schemas[common.aud_to_str(aud)] = protos.Schema(json_schema=schema)

    def _handle_schema(
        self, aud: protos.Audience, step: protos.PipelineStep, resp: protos.WasmResponse
    ) -> None:
        # Only handle schema steps
        (step_type, _) = which_one_of(step, "step")
        if step_type != "infer_schema":
            return

        # Only successful schema inferences
        if resp.exit_code != protos.WasmExitCode.WASM_EXIT_CODE_SUCCESS:
            return

        # If existing schema matches, do nothing
        existing_schema = self._get_schema(aud)
        if existing_schema == resp.output_step:
            return

        # New or updated schema, send to server
        async def call():
            req = protos.SendSchemaRequest(
                audience=aud,
                schema=protos.Schema(json_schema=resp.output_step),
            )
            await self.grpc_stub.send_schema(
                send_schema_request=req, metadata=self._get_metadata()
            )
            self.log.debug(f"Published schema for audience '{common.aud_to_str(aud)}'")

        self._set_schema(aud, resp.output_step)
        self.grpc_loop.create_task(call())
