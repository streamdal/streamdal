import uuid

import pytest
from snitchpy import SnitchClient, SnitchConfig
from wasmtime import Store, Memory, MemoryType, Limits
from snitch_protos.protos import PipelineStep, PipelineStepCondition
from snitch_protos.protos.steps import DetectiveStep, DetectiveType


class TestSnitchClient:
    def test_valid_config(self):
        # A valid config should not raise any exception
        config = SnitchConfig(
            service_name="MyService",
            grpc_url="localhost",
            grpc_port=9090,
            grpc_token="fake token"
        )
        assert SnitchClient._validate_config(config) is None

    def test_missing_config(self):
        # Test when a required field (service_name) is missing
        with pytest.raises(ValueError, match="service_name is required"):
            SnitchClient._validate_config(SnitchConfig(
                service_name="",
                grpc_url="localhost",
                grpc_port=9090,
                grpc_token="fake token"
            ))

        # Test when grpc_url is missing
        with pytest.raises(ValueError, match="grpc_url is required"):
            SnitchClient._validate_config(SnitchConfig(
                service_name="writer",
                grpc_url="",
                grpc_port=9090,
                grpc_token="fake token"
            ))

        # Test when grpc_port is missing
        with pytest.raises(ValueError, match="grpc_port is required"):
            SnitchClient._validate_config(SnitchConfig(
                service_name="writer",
                grpc_url="localhost",
                grpc_port=0,
                grpc_token="fake token"
            ))

        # Test when grpc_token is missing
        with pytest.raises(ValueError, match="grpc_token is required"):
            SnitchClient._validate_config(SnitchConfig(
                service_name="writer",
                grpc_url="localhost",
                grpc_port=9090,
                grpc_token=""
            ))

    def test_missing_cfg(self):
        # Test when cfg is None
        with pytest.raises(ValueError, match="cfg is required"):
            SnitchClient._validate_config(None)

    def test_read_memory_within_bounds(self):
        """Test reading within bounds of memory"""
        store = Store()
        memory = Memory(store, MemoryType(Limits(1, 1024)))
        data = b'Hello, World!\xa6\xa6\xa6'
        memory.write(store, data, 0)

        result = SnitchClient._read_memory(memory, store, 0, len(data))
        assert result == b'Hello, World!'

    # def test_read_memory_with_length(self):
    #     """Test reading within bounds with a specified length"""
    #     store = Store()
    #     memory = Memory(store, MemoryType(Limits(1, 1024)))
    #     data = b'Hello, World!'
    #     memory.write(store, data, 0)
    #
    #     result = SnitchClient._read_memory(memory, store, 0, 5)
    #     assert result == b'Hello'
    #
    # def test_read_memory_out_of_bounds(self):
    #     """Test reading out of bounds of memory"""
    #     store = Store()
    #     memory = Memory(store, MemoryType(Limits(1, 1)))
    #     data = b'Hello, World!'
    #     memory.write(store, data, 0)
    #     page_size = 64 * 1024  # 64 KB
    #
    #     with pytest.raises(SnitchException) as exc_info:
    #         SnitchClient._read_memory(memory, store, page_size + 1)

        # assert str(exc_info.value) == "WASM memory pointer out of bounds"

    def test_read_memory_with_interspersed_pointers(self):
        """Test reading with null pointers"""
        store = Store()
        memory = Memory(store, MemoryType(Limits(1, 1)))
        data = b'Hel\xa6lo,\xa6 W\xa6orld!\xa6\xa6\xa6'
        memory.write(store, data, 0)

        result = SnitchClient._read_memory(memory, store, 0)
        assert result == b'Hel\xa6lo,\xa6 W\xa6orld!'  # Should NOT stop at the third terminator character

    def test_call_wasm(self):
        """Test we can execute a wasm file"""

        client = object.__new__(SnitchClient)
        client.functions = {}

        with open("./assets/test/detective.wasm", "rb") as file:
            wasm_bytes = file.read()

        step = PipelineStep(
            name="detective",
            on_success=[],
            on_failure=[PipelineStepCondition(PipelineStepCondition.PIPELINE_STEP_CONDITION_ABORT)],
            wasm_bytes=wasm_bytes,
            wasm_id=uuid.uuid4().__str__(),
            wasm_function="f",
            detective=DetectiveStep(
                path="object.field",
                args=["streamdal"],
                negate=False,
                type=DetectiveType.DETECTIVE_TYPE_STRING_CONTAINS_ANY,
            )
        )

        res = client._call_wasm(step=step, data=b'{"object":  {"field": "streamdal@gmail.com"}}')

        assert res is not None
        assert res.exit_code == 1
        assert res.output == b'{"object":  {"field": "streamdal@gmail.com"}}'

        res2 = client._call_wasm(step=step, data=b'{"object":  {"field": "mark@gmail.com"}}')

        assert res2 is not None
        assert res2.exit_code == 2
