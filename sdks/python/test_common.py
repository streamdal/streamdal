import streamdal_protos.protos as protos
import streamdal.common as common
from wasmtime import Store, Memory, MemoryType, Limits


class TestCommon:
    def test_aud_to_str(self):
        aud = protos.Audience(
            component_name="kafka",
            service_name="testing",
            operation_name="test-topic",
            operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
        )

        assert common.aud_to_str(aud) == "testing.kafka.2.test-topic"

    def test_str_to_aud(self):
        aud = protos.Audience(
            component_name="kafka",
            service_name="testing",
            operation_name="test-topic",
            operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
        )

        parsed = common.str_to_aud("testing.kafka.2.test-topic")
        assert parsed.component_name == aud.component_name
        assert parsed.service_name == aud.service_name
        assert parsed.operation_name == aud.operation_name
        assert parsed.operation_type == aud.operation_type

    def test_read_memory_within_bounds(self):
        """Test reading within bounds of memory"""
        store = Store()
        memory = Memory(store, MemoryType(Limits(1, 1024)))
        data = b"Hello, World!"
        memory.write(store, data, 0)

        result = common.read_memory(memory, store, 0, len(data))
        assert result == b"Hello, World!"

    def test_read_memory_all(self):
        """Test not passing a length should read all memory"""
        store = Store()
        memory = Memory(store, MemoryType(Limits(1, 1)))
        data = b"Hello, world!"
        memory.write(store, data, 0)
        result = common.read_memory(memory, store, 0)

        # Allocated memory should be the same as the length of the result data
        assert memory.data_len(store) == len(result)

        # Beginning of result should contain the data we wrote
        assert result.startswith(data)

    def test_read_memory_unpack_ptr(self):
        """Test passing a length of '-1' should unpack the length from the pointer"""
        store = Store()
        memory = Memory(store, MemoryType(Limits(1, 1)))
        data = b"Hello, world!"
        ptr_packed = 0 << 32 | len(data)

        # Write data from the start
        memory.write(store, data, 0)

        result = common.read_memory(memory, store, ptr_packed, -1)

        assert result == data
