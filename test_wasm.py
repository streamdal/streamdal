import asyncio
import pytest
import streamdal
import streamdal_protos.protos as protos
import unittest.mock as mock
import uuid
from streamdal import StreamdalClient, StreamdalConfig, hostfunc, kv


class TestStreamdalWasm:
    client: StreamdalClient

    @pytest.fixture(autouse=True)
    def before_each(self):
        client = object.__new__(StreamdalClient)
        client.cfg = StreamdalConfig(service_name="testing")
        client.functions = {}
        client.kv = kv.KV()
        client.host_func = hostfunc.HostFunc(kv=client.kv)
        client.paused_pipelines = {}
        client.pipelines = {}
        client.audiences = {}
        client.tails = {}
        client.paused_tails = {}
        client.schemas = {}
        client.log = mock.Mock()
        client.metrics = mock.Mock()
        client.grpc_stub = mock.AsyncMock()
        client.register_stub = mock.AsyncMock()
        client.grpc_loop = asyncio.get_event_loop()
        client.register_loop = asyncio.get_event_loop()
        self.client = client

    def test_call_wasm_failure(self, mocker):
        mocker.patch(
            "streamdal.StreamdalClient._exec_wasm",
            side_effect=Exception("something happened"),
        )
        client = object.__new__(StreamdalClient)

        step = protos.PipelineStep()

        res = client._call_wasm(step=step, data=b"", isr=None)

        assert res is not None
        assert res.exit_code == 3

    def test_detective_wasm(self):
        """Test we can execute the detective wasm file"""

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

        res = self.client._call_wasm(
            step=step, data=b'{"object":  {"field": "streamdal@gmail.com"}}', isr=None
        )

        assert res is not None
        assert res.exit_code == 1
        assert res.output_payload == b'{"object":  {"field": "streamdal@gmail.com"}}'

        res2 = self.client._call_wasm(
            step=step, data=b'{"object":  {"field": "mark@gmail.com"}}', isr=None
        )

        assert res2 is not None
        assert res2.exit_code == 2

    def test_http_request_wasm(self):
        """Test we can execute http_request wasm file"""

        with open("./assets/test/httprequest.wasm", "rb") as file:
            wasm_bytes = file.read()

        step = protos.PipelineStep(
            name="httprequest test",
            on_success=[],
            on_failure=[],
            wasm_bytes=wasm_bytes,
            wasm_id=uuid.uuid4().__str__(),
            wasm_function="f",
            http_request=protos.steps.HttpRequestStep(
                request=protos.steps.HttpRequest(
                    url="https://www.streamdal.com/404_me",
                    method=protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_GET,
                ),
            ),
        )

        res = self.client._call_wasm(step=step, data=b"", isr=None)

        assert res is not None
        assert res.exit_code == 2
        assert res.exit_msg == "Request returned non-200 response code: 404"

    def test_infer_schema(self):
        """Test we can infer schema from json using the wasm module"""

        with open("./assets/test/inferschema.wasm", "rb") as file:
            wasm_bytes = file.read()

        step = protos.PipelineStep(
            name="inferschema test",
            on_success=[],
            on_failure=[],
            wasm_bytes=wasm_bytes,
            wasm_id=uuid.uuid4().__str__(),
            wasm_function="f",
            infer_schema=protos.steps.InferSchemaStep(current_schema=b""),
        )

        res = self.client._call_wasm(
            step=step, data=b'{"object": {"payload": "test"}}', isr=None
        )

        assert res is not None
        assert res.exit_code == 1
        assert res.exit_msg == "inferred fresh schema"
        assert res.output_payload == b'{"object": {"payload": "test"}}'
        assert (
            res.output_step
            == b'{"$schema":"http://json-schema.org/draft-07/schema#","properties":{"object":{"properties":{'
            b'"payload":{"type":"string"}},"required":["payload"],"type":"object"}},"required":["object"],'
            b'"type":"object"}'
        )

    def test_transform_wasm_replace(self):
        """Test we can execute the transform wasm module"""

        with open("./assets/test/transform.wasm", "rb") as file:
            wasm_bytes = file.read()

        step = protos.PipelineStep(
            name="transform test - replace",
            on_success=[],
            on_failure=[],
            wasm_bytes=wasm_bytes,
            wasm_id=uuid.uuid4().__str__(),
            wasm_function="f",
            transform=protos.steps.TransformStep(
                path="object.payload",
                value='"new val"',
                type=protos.steps.TransformType.TRANSFORM_TYPE_REPLACE_VALUE,
                replace_value_options=protos.steps.TransformReplaceValueOptions(
                    path="object.payload",
                    value='"new val"',
                ),
            ),
        )

        res = self.client._call_wasm(
            step=step, data=b'{"object": {"payload": "old val"}}', isr=None
        )

        assert res is not None
        assert res.exit_code == 1
        assert res.exit_msg == "Successfully transformed payload"
        assert res.output_payload == b'{"object": {"payload": "new val"}}'

    def test_transform_wasm_truncate(self):
        """Test we can execute the transform wasm module"""

        with open("./assets/test/transform.wasm", "rb") as file:
            wasm_bytes = file.read()

        step = protos.PipelineStep(
            name="transform test - truncate",
            on_success=[],
            on_failure=[],
            wasm_bytes=wasm_bytes,
            wasm_id=uuid.uuid4().__str__(),
            wasm_function="f",
            transform=protos.steps.TransformStep(
                type=protos.steps.TransformType.TRANSFORM_TYPE_TRUNCATE_VALUE,
                truncate_options=protos.steps.TransformTruncateOptions(
                    path="object.payload",
                    type=protos.steps.TransformTruncateType.TRANSFORM_TRUNCATE_TYPE_LENGTH,
                    value=3,
                ),
            ),
        )

        res = self.client._call_wasm(
            step=step, data=b'{"object": {"payload": "old val"}}', isr=None
        )

        assert res is not None
        assert res.exit_code == 1
        assert res.output_payload == b'{"object": {"payload": "old"}}'

    def test_validjson_wasm(self):
        with open("./assets/test/validjson.wasm", "rb") as file:
            wasm_bytes = file.read()

        step = protos.PipelineStep(
            name="valid json test",
            on_success=[],
            on_failure=[],
            wasm_bytes=wasm_bytes,
            wasm_id=uuid.uuid4().__str__(),
            wasm_function="f",
            valid_json=protos.steps.ValidJsonStep(),
        )

        # valid json
        res = self.client._call_wasm(
            step=step, data=b'{"object": {"payload": "old val"}}', isr=None
        )

        assert res is not None
        assert res.exit_code == 1
        assert res.output_payload == b'{"object": {"payload": "old val"}}'

        # invalid json
        res = self.client._call_wasm(
            step=step, data=b'{"object": {"payload": "old val}}', isr=None
        )

        assert res is not None
        assert res.exit_code == 2
        assert res.output_payload == b'{"object": {"payload": "old val}}'

    def test_kv_wasm(self):
        """Test we can execute a wasm file"""

        self.client.kv.set("test", "test")

        with open("./assets/test/kv.wasm", "rb") as file:
            wasm_bytes = file.read()

        step = protos.PipelineStep(
            name="KV exists test",
            on_success=[],
            on_failure=[],
            wasm_bytes=wasm_bytes,
            wasm_id=uuid.uuid4().__str__(),
            wasm_function="f",
            kv=protos.steps.KvStep(
                action=protos.shared.KvAction.KV_ACTION_EXISTS,
                key="test",
                mode=protos.steps.KvMode.KV_MODE_STATIC,
            ),
        )

        res = self.client._call_wasm(step=step, data=b"", isr=None)

        assert res is not None
        assert res.exit_code == 1
        assert res.exit_msg == "kv step response: \"Key 'test' exists\""

    def test_dynamic_transform(self):
        """Test that we can pass detective results to a transform step"""

        with open("./assets/test/detective.wasm", "rb") as file:
            detective_wasm_bytes = file.read()

        with open("./assets/test/transform.wasm", "rb") as file:
            transform_wasm_bytes = file.read()

        cmd = protos.Command(
            audience=protos.Audience(
                component_name="kafka",
                service_name="testing",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
                operation_name="test",
            ),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(
                    id=uuid.uuid4().__str__(),
                    steps=[
                        protos.PipelineStep(
                            name="detective",
                            on_success=[],
                            on_failure=[],
                            wasm_bytes=detective_wasm_bytes,
                            wasm_id=uuid.uuid4().__str__(),
                            wasm_function="f",
                            detective=protos.steps.DetectiveStep(
                                path="",  # No path, we're searching the entire payload
                                args=[""],
                                negate=False,
                                type=protos.steps.DetectiveType.DETECTIVE_TYPE_PII_EMAIL,
                            ),
                        ),
                        protos.PipelineStep(
                            dynamic=True,
                            name="transform",
                            on_success=[],
                            on_failure=[],
                            wasm_bytes=transform_wasm_bytes,
                            wasm_id=uuid.uuid4().__str__(),
                            wasm_function="f",
                            transform=protos.steps.TransformStep(
                                type=protos.steps.TransformType.TRANSFORM_TYPE_REPLACE_VALUE,
                                replace_value_options=protos.steps.TransformReplaceValueOptions(
                                    path="",  # No path, we're getting the result from the detective step
                                    value='"REDACTED"',
                                ),
                            ),
                        ),
                    ],
                )
            ),
        )

        self.client._attach_pipeline(cmd)
        payload = b'{"users":[{"name": "Bob","email": "bob@streamdal.com"}]}'

        res = self.client.process(
            streamdal.ProcessRequest(
                data=payload,
                operation_name="test",
                operation_type=streamdal.OPERATION_TYPE_PRODUCER,
                component_name="kafka",
            )
        )

        assert res is not None
        assert res.error is False
        assert res.data == b'{"users":[{"name": "Bob","email": "REDACTED"}]}'
