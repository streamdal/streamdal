import snitch_protos.protos as protos
import uuid
from snitchpy import SnitchClient
from wasmtime import Store, Memory, MemoryType, Limits


class TestSnitchWasm:
    def test_read_memory_within_bounds(self):
        """Test reading within bounds of memory"""
        store = Store()
        memory = Memory(store, MemoryType(Limits(1, 1024)))
        data = b"Hello, World!\xa6\xa6\xa6"
        memory.write(store, data, 0)

        result = SnitchClient._read_memory(memory, store, 0, len(data))
        assert result == b"Hello, World!"

    def test_read_memory_with_interspersed_pointers(self):
        """Test reading with null pointers"""
        store = Store()
        memory = Memory(store, MemoryType(Limits(1, 1)))
        data = b"Hel\xa6lo,\xa6 W\xa6orld!\xa6\xa6\xa6"
        memory.write(store, data, 0)

        result = SnitchClient._read_memory(memory, store, 0)
        assert (
            result == b"Hel\xa6lo,\xa6 W\xa6orld!"
        )  # Should NOT stop at the third terminator character

    def test_call_wasm(self):
        """Test we can execute a wasm file"""

        client = object.__new__(SnitchClient)
        client.functions = {}

        with open("./assets/test/detective.wasm", "rb") as file:
            wasm_bytes = file.read()

        step = protos.PipelineStep(
            name="detective",
            on_success=[],
            on_failure=[],
            wasm_bytes=wasm_bytes,
            wasm_id=uuid.uuid4().__str__(),
            wasm_function="f",
            detective=protos.steps.DetectiveStep(
                path="object.field",
                args=["streamdal"],
                negate=False,
                type=protos.steps.DetectiveType.DETECTIVE_TYPE_STRING_CONTAINS_ANY,
            ),
        )

        res = client._call_wasm(
            step=step, data=b'{"object":  {"field": "streamdal@gmail.com"}}'
        )

        assert res is not None
        assert res.exit_code == 1
        assert res.output == b'{"object":  {"field": "streamdal@gmail.com"}}'

        res2 = client._call_wasm(
            step=step, data=b'{"object":  {"field": "mark@gmail.com"}}'
        )

        assert res2 is not None
        assert res2.exit_code == 2
