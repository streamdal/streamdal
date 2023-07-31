import logging
import pytest
import snitch_protos.protos as protos
import uuid
from snitchpy import SnitchClient, SnitchConfig
from wasmtime import Store, Memory, MemoryType, Limits

logging.basicConfig()
logger = logging.getLogger("abc")
logger.setLevel(logging.CRITICAL)

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
            )
        )

        res = client._call_wasm(step=step, data=b'{"object":  {"field": "streamdal@gmail.com"}}')

        assert res is not None
        assert res.exit_code == 1
        assert res.output == b'{"object":  {"field": "streamdal@gmail.com"}}'

        res2 = client._call_wasm(step=step, data=b'{"object":  {"field": "mark@gmail.com"}}')

        assert res2 is not None
        assert res2.exit_code == 2

    def test_is_paused(self):
        """Test is_paused returns True when paused"""
        client = object.__new__(SnitchClient)
        client.paused_pipelines = {}

        aud = protos.Audience(
            component_name="test",
            operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER
        )

        pipeline_id = uuid.uuid4().__str__()
        aud_str = SnitchClient.audience(aud)
        client.paused_pipelines[aud_str] = {}
        client.paused_pipelines[aud_str][pipeline_id] = protos.Command

        assert client._is_paused(aud, uuid.uuid4().__str__()) is False
        assert client._is_paused(aud, pipeline_id) is True

    def test_attach_pipeline(self):
        """Test set_pipeline adds a pipeline to the pipelines dict"""

        client = object.__new__(SnitchClient)
        client.pipelines = {}
        client.paused_pipelines = {}
        client.log = logger

        pipeline_id = uuid.uuid4().__str__()

        cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER
            ),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(
                    id=pipeline_id,
                )
            )
        )

        client._attach_pipeline(cmd)

        aud_str = SnitchClient.audience(cmd.audience)
        assert client.pipelines[aud_str] is not None
        assert client.pipelines[aud_str][pipeline_id] is not None

    def test_pop_pipeline(self):
        client = object.__new__(SnitchClient)
        client.pipelines = {}
        client.paused_pipelines = {}
        client.log = logger

        pipeline_id = uuid.uuid4().__str__()

        cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER
            ),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(
                    id=pipeline_id,
                )
            )
        )

        client._attach_pipeline(cmd)

        pipeline = SnitchClient._pop_pipeline(client.pipelines, cmd, pipeline_id)

        assert pipeline is not None
        assert pipeline.attach_pipeline.pipeline.id == pipeline_id

    def test_pause_pipeline(self):
        client = object.__new__(SnitchClient)
        client.cfg = SnitchConfig(service_name="testing")
        client.pipelines = {}
        client.paused_pipelines = {}
        client.log = logger

        pipeline_id = uuid.uuid4().__str__()

        cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                service_name="testing",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
            ),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(
                    id=pipeline_id,
                )
            )
        )

        client._attach_pipeline(cmd)

        pause_cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                service_name="testing",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER
            ),
            pause_pipeline=protos.PausePipelineCommand(
                pipeline_id=pipeline_id,
            )
        )

        res = client._pause_pipeline(pause_cmd)
        assert res is True

        aud_str = SnitchClient.audience(cmd.audience)
        assert len(client.paused_pipelines) == 1
        assert len(client.pipelines) == 0
        assert client.paused_pipelines[aud_str] is not None
        assert client.paused_pipelines[aud_str][pipeline_id] is not None

    def test_delete_pipeline(self):
        client = object.__new__(SnitchClient)
        client.cfg = SnitchConfig(service_name="testing")
        client.pipelines = {}
        client.paused_pipelines = {}
        client.log = logger

        pipeline_id = uuid.uuid4().__str__()

        cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                service_name="testing",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
            ),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(
                    id=pipeline_id,
                )
            )
        )

        client._attach_pipeline(cmd)

        delete_cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                service_name="testing",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER
            ),
            detach_pipeline=protos.DetachPipelineCommand(
                pipeline_id=pipeline_id,
            )
        )

        res = client._detatch_pipeline(delete_cmd)

        assert res is True
        assert len(client.pipelines) == 0
        assert len(client.paused_pipelines) == 0
