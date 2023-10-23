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
        data = b"Hello, World!\xa6\xa6\xa6"
        memory.write(store, data, 0)

        result = common.read_memory(memory, store, 0, len(data))
        assert result == b"Hello, World!"

    def test_read_memory_with_interspersed_pointers(self):
        """Test reading with null pointers"""
        store = Store()
        memory = Memory(store, MemoryType(Limits(1, 1)))
        data = b"Hel\xa6lo,\xa6 W\xa6orld!\xa6\xa6\xa6"
        memory.write(store, data, 0)

        result = common.read_memory(memory, store, 0)
        assert (
            result == b"Hel\xa6lo,\xa6 W\xa6orld!"
        )  # Should NOT stop at the third terminator character
