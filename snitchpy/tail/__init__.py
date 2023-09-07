import logging
import asyncio
import snitch_protos.protos as protos
from queue import SimpleQueue, Empty
from threading import Lock, Event

# The number of tail worker threads to start
NUM_TAIL_WORKERS = 2


class Tail:
    request: protos.TailRequest
    grpc_stub: protos.InternalStub
    grpc_loop: asyncio.AbstractEventLoop
    auth_token: str
    lock: Lock = Lock()
    exit: Event = Event()
    queue: SimpleQueue = SimpleQueue()
    log: logging.Logger = logging.getLogger("snitch-client")

    def __init__(
        self,
        request: protos.TailRequest,
        grpc_stub: protos.InternalStub,
        grpc_loop: asyncio.AbstractEventLoop,
        exit: Event,
        auth_token: str,
        log: logging.Logger,
    ):
        self.request = request
        self.grpc_stub = grpc_stub
        self.grpc_loop = grpc_loop
        self.queue = SimpleQueue()
        self.exit = exit
        self.log = log
        self.auth_token = auth_token

    def tail_iterator(self):
        while True:
            try:
                yield self.queue.get(timeout=1)
            except Empty:
                if self.exit.is_set():
                    return

    def start_tail_workers(self):
        for i in range(NUM_TAIL_WORKERS):
            self.start_tail_worker()

    def start_tail_worker(self):
        self.log.debug("Starting tail worker")

        # Get gRPC tail stream
        async def call():
            await self.grpc_stub.send_tail(
                tail_response_iterator=self.tail_iterator(),
                metadata={"auth-token": self.auth_token},
            )

        while not self.exit.is_set():
            self.grpc_loop.run_until_complete(call())

        self.log.debug("Tail worker exiting")
