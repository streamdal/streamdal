import asyncio
import logging
import os
import snitch_protos.protos as protos
import socket
from time import sleep
from dataclasses import dataclass
from grpclib.client import Channel
from metrics import Metrics
from wasmtime import Config, Engine, Linker, Module, Store, Memory, WasiConfig, Instance
from .exceptions import SnitchException, SnitchRegisterException

DEFAULT_SNITCH_PORT = 9090
DEFAULT_SNITCH_URL = "localhost"
DEFAULT_SNITCH_TOKEN = "1234"
DEFAULT_PIPELINE_TIMEOUT = 1/10  # 100 milliseconds
DEFAULT_STEP_TIMEOUT = 1/100  # 10 milliseconds
DEFAULT_GRPC_TIMEOUT = 5  # 5 seconds
DEFAULT_HEARTBEAT_INTERVAL = 30  # 30 seconds
MAX_PAYLOAD_SIZE = 1024 * 1024  # 1 megabyte

MODE_CONSUME = 1
MODE_PRODUCE = 2


@dataclass(frozen=True)
class SnitchRequest:
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

    def __init__(self, cfg: SnitchConfig):
        self.__validate_config(cfg)

        channel = Channel(host=cfg.grpc_url, port=cfg.grpc_port)
        self.channel = channel
        self.stub = protos.InternalStub(channel=self.channel)
        self.auth_token = cfg.grpc_token
        self.loop = asyncio.get_event_loop()
        self.grpc_timeout = 5
        self.pipelines = {}
        self.paused_pipelines = {}
        self.log = logging.getLogger("snitch-client")
        self.metrics = Metrics(stub=self.stub, log=self.log)
        self.functions = {}  # TODO: needed?

        # Run register
        self.__register()

        # Start heartbeat
        self.__run_heartbeat()

    @staticmethod
    def __validate_config(cfg: SnitchConfig) -> None:
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
        pass

    def __run_heartbeat(self):
        async def call():
            while True:
                await self.stub.heartbeat(protos.HeartbeatRequest(), timeout=self.grpc_timeout, metadata=self.__get_metadata())

        self.loop.run_until_complete(call())

    def __get_metadata(self) -> dict:
        """Returns map of metadata needed for gRPC calls"""
        return {"auth-token": self.auth_token}

    def close(self) -> None:
        """Close the connection to the Snitch Server"""
        self.log.debug("Closing gRPC connection")
        self.channel.close()

    def __heartbeat(self):
        async def call():
            self.log.debug("Sending heartbeat")
            req = protos.HeartbeatRequest()
            req.service_name = self.cfg.service_name

            await self.stub.heartbeat(req, timeout=self.grpc_timeout, metadata=self.__get_metadata())

        while True:
            sleep(DEFAULT_HEARTBEAT_INTERVAL) # TODO: what should heartbeat interval be?
            self.loop.run_until_complete(call())

    async def __register(self) -> None:
        """Register the service with the Snitch Server and receive a stream of commands to execute"""
        async def call():
            self.log.debug("Registering with snitch server")

            req = protos.RegisterRequest()
            req.dry_run = self.cfg.dry_run
            req.service_name = self.cfg.service_name

            async for r in self.stub.register(req, timeout=self.grpc_timeout, metadata=self.__get_metadata()):
                if r.keep_alive is not None:
                    self.log.debug("Received keep alive")  # TODO: remove logging
                    pass
                elif r.set_pipeline is not None:
                    self.__set_pipeline(r)
                elif r.delete_pipeline is not None:
                    self.__delete_pipeline(r)
                elif r.pause_pipeline is not None:
                    self.__pause_pipeline(r)
                elif r.unpause_pipeline is not None:
                    self.__unpause_pipeline(r)
                else:
                    raise SnitchException("Unknown response type: {}".format(r))

        self.log.debug("Starting register looper")

        try:
            self.loop.run_until_complete(call())
            self.log.debug("Register looper completed, closing connection")
        except Exception as e:
            # Calling client should handle this. Maybe wrap in custom exception type?
            raise SnitchRegisterException("Failed to register: {}".format(e))

    @staticmethod
    def __put_pipeline(pipes_map: dict, aud: protos.Audience, pipeline_id: str, steps: list[protos.PipelineStep]) -> None:
        """Set pipeline in internal map of pipelines"""
        mode = aud.operation_type.__str__()
        topic = aud.topic

        # Create mode key if it doesn't exist
        if pipes_map.get(mode) is None:
            pipes_map[mode] = {}

        # Create topic key if it doesn't exist
        if pipes_map[mode].get(topic) is None:
            pipes_map[mode][topic] = {}

        pipes_map[mode][topic][pipeline_id] = steps

    @staticmethod
    def __pop_pipeline(pipes_map: dict, aud: protos.Audience, pipeline_id: str) -> list[protos.PipelineStep] | None:
        """Grab pipeline in internal map of pipelines and remove it"""
        mode = aud.operation_type.__str__()
        topic = aud.topic

        if pipes_map.get(mode) is None:
            return None

        if pipes_map[mode].get(topic) is None:
            return None

        if pipes_map[mode][topic].get(pipeline_id) is None:
            return None

        pipeline = pipes_map[mode][topic][pipeline_id]
        del pipes_map[mode][topic][pipeline_id]

        if len(pipes_map[mode][topic]) == 0:
            del pipes_map[mode][topic]

        if len(pipes_map[mode]) == 0:
            del pipes_map[mode]

        return pipeline

    def __delete_pipeline(self, cmd: protos.CommandResponse) -> bool:
        """Delete pipeline from internal map of pipelines"""
        if cmd is None:
            raise ValueError("Command is None")

        if cmd.audience.operation_type == protos.OperationType.OPERATION_TYPE_UNSET:
            raise ValueError("Operation type not set")

        if cmd.audience.service_name != self.cfg.service_name:
            self.log.debug("Service name does not match, ignoring")
            return False

        self.log.debug("Deleting pipeline {} for audience {}".format(cmd.delete_pipeline.id, cmd.audience.operation_type))

        # Delete from all maps
        self.__pop_pipeline(self.pipelines, cmd.audience, cmd.delete_pipeline.id)
        self.__pop_pipeline(self.paused_pipelines, cmd.audience, cmd.delete_pipeline.id)

        return True

    def __set_pipeline(self, cmd: protos.CommandResponse) -> bool:
        """
        Put pipeline in internal map of pipelines

        If the pipeline is paused, the paused map will be updated, otherwise active will
        This is to ensure pauses/resumes are explicit
        """
        if self.__is_paused(cmd.audience, cmd.set_pipeline.id):
            self.log.debug("Pipeline {} is paused, updating in paused list".format(cmd.set_pipeline.id))
            self.__put_pipeline(self.paused_pipelines, cmd.audience, cmd.set_pipeline.id, cmd.set_pipeline.steps)
        else:
            self.log.debug("Pipeline {} is not paused, updating in active list".format(cmd.set_pipeline.id))
            self.__put_pipeline(self.pipelines, cmd.audience, cmd.set_pipeline.id, cmd.set_pipeline.steps)

        return True

    def __pause_pipeline(self, cmd: protos.CommandResponse) -> bool:
        """Pauses execution of a specified pipeline"""
        if cmd is None:
            self.log.error("Command is None")
            return False

        if cmd.audience.operation_type == protos.OperationType.OPERATION_TYPE_UNSET:
            self.log.error("Operation type not set")
            return False

        # Remove from pipelines and add to paused pipelines
        pipeline = self.__pop_pipeline(self.pipelines, cmd.audience, cmd.pause_pipeline.id)
        self.__put_pipeline(self.paused_pipelines, cmd.audience, cmd.pause_pipeline.id, pipeline)

        return True

    def __unpause_pipeline(self, cmd: protos.CommandResponse):
        """Resumes execution of a specified pipeline"""
        self.log.debug("Resuming pipeline {} for audience {}".format(cmd.unpause_pipeline.id, cmd.audience.service_name))

    def __is_paused(self, aud: protos.Audience, pipeline_id: str) -> bool:
        """Check if a pipeline is paused"""
        mode = aud.operation_type.__str__()
        topic = aud.topic

        if self.paused_pipelines.get(mode) is None:
            return False

        if self.paused_pipelines[mode].get(topic) is None:
            return False

        if self.paused_pipelines[mode][topic].get(pipeline_id) is None:
            return False

        return True

    def get_function(self, name: str) -> (Instance, Store):
        """Get a function from the internal map of functions"""
        if self.functions.get(name) is not None:
            return self.functions[name]

        # Function not instantiated yet
        cfg = Config()
        engine = Engine(cfg)

        linker = Linker(engine)
        linker.define_wasi()

        module = Module.from_file(linker.engine, "./{}.wasm".format(name))

        wasi = WasiConfig()
        wasi.inherit_stdout()
        wasi.inherit_stdin()
        wasi.inherit_stderr()

        store = Store(linker.engine)
        store.set_wasi(wasi)

        instance = linker.instantiate(store, module)

        self.functions[name] = (instance, store)
        return instance, store

    def exec_wasm(self, data: bytes) -> bytearray:
        try:
            instance, store = self.get_function("detective")
        except Exception as e:
            raise SnitchException("Failed to instantiate function: {}".format(e))

        # Get memory from module
        memory = instance.exports(store)["memory"]
        memory.grow(store, 14)  # Set memory limit to 1MB

        # Get alloc() from module
        alloc = instance.exports(store)["alloc"]
        # Allocate enough memory for the length of the data and receive memory pointer
        start_ptr = alloc(store, len(data))

        # Write to memory starting at pointer returned bys alloc()
        memory.write(store, data, start_ptr)

        # Execute the function
        f = instance.exports(store)["f"]
        result_ptr = f(store, start_ptr, len(data))

        # Read from result pointer
        return self.__read_memory(memory, store, result_ptr)

    @staticmethod
    def __read_memory(memory: Memory, store: Store, result_ptr: int, length: int = 0) -> bytearray:
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
            if nulls == 3 and length == 0:
                break

            if v == 0:
                nulls += 1
                continue

            res.append(v)
            count += 1

            if length == count:
                break

        return res
