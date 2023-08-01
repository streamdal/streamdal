import asyncio
import logging
import threading
import pytest
import snitch_protos.protos as protos
import uuid
import unittest.mock as mock
import snitchpy
from snitchpy import SnitchClient, SnitchConfig


class TestSnitchClient:

    client: SnitchClient

    @pytest.fixture(autouse=True)
    def before_each(self):
        client = object.__new__(SnitchClient)
        client.cfg = SnitchConfig(service_name="testing")
        client.loop = asyncio.get_event_loop()
        client.log = mock.Mock()
        client.metrics = mock.Mock()
        client.stub = mock.AsyncMock()
        client.grpc_timeout = 5
        client.auth_token = "test"
        client.exit = threading.Event()
        client.session_id = uuid.uuid4().__str__()
        client.pipelines = {}
        client.paused_pipelines = {}

        self.client = client

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

        self.client._attach_pipeline(cmd)

        aud_str = SnitchClient.audience(cmd.audience)
        assert self.client.pipelines[aud_str] is not None
        assert self.client.pipelines[aud_str][pipeline_id] is not None

    def test_pop_pipeline(self):
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

        self.client._attach_pipeline(cmd)

        pipeline = SnitchClient._pop_pipeline(self.client.pipelines, cmd, pipeline_id)

        assert pipeline is not None
        assert pipeline.attach_pipeline.pipeline.id == pipeline_id

    def test_pause_resume_pipeline(self):
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

        self.client._attach_pipeline(cmd)

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

        with pytest.raises(ValueError, match="Command is None"):
            self.client._pause_pipeline(None)

        res = self.client._pause_pipeline(pause_cmd)
        assert res is True

        aud_str = SnitchClient.audience(cmd.audience)
        assert len(self.client.paused_pipelines) == 1
        assert len(self.client.pipelines) == 0
        assert self.client.paused_pipelines[aud_str] is not None
        assert self.client.paused_pipelines[aud_str][pipeline_id] is not None

        resume_cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                service_name="testing",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER
            ),
            resume_pipeline=protos.ResumePipelineCommand(
                pipeline_id=pipeline_id,
            )
        )

        with pytest.raises(ValueError, match="Command is None"):
            self.client._resume_pipeline(None)

        res = self.client._resume_pipeline(resume_cmd)
        assert res is True

        aud_str = SnitchClient.audience(cmd.audience)
        assert len(self.client.paused_pipelines) == 0
        assert len(self.client.pipelines) == 1
        assert self.client.pipelines[aud_str] is not None
        assert self.client.pipelines[aud_str][pipeline_id] is not None

    def test_detach_pipeline(self):
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

        self.client._attach_pipeline(cmd)

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

        with pytest.raises(ValueError, match="Command is None"):
            self.client._detach_pipeline(None)

        res = self.client._detach_pipeline(delete_cmd)
        assert res is True
        assert len(self.client.pipelines) == 0
        assert len(self.client.paused_pipelines) == 0

    def test_process_validation(self):
        with pytest.raises(ValueError, match="req is required"):
            self.client.process(None)

    def test_process_max_size(self):
        fake_metrics = mock.Mock()

        self.client.cfg = SnitchConfig(service_name="testing")
        self.client.metrics = fake_metrics
        payload = bytearray(snitchpy.MAX_PAYLOAD_SIZE + 1)
        payload_bytes = bytes(payload)

        res = self.client.process(snitchpy.SnitchRequest(data=payload_bytes, operation=1, component="test"))

        assert res is not None
        assert res.data == payload_bytes
        fake_metrics.incr.assert_called_once()

    def test_notify_condition(self):
        fake_stub = mock.AsyncMock()
        fake_metrics = mock.Mock()

        self.client.metrics = fake_metrics
        self.client.stub = fake_stub

        pipeline = protos.Pipeline(id=uuid.uuid4().__str__())
        step = protos.PipelineStep(name="test")
        aud = protos.Audience()

        self.client._notify_condition(pipeline, step, aud)
        fake_stub.notify.assert_called_once()
        fake_metrics.incr.assert_called_once()

    def test_heartbeat(self):
        fake_stub = mock.AsyncMock()

        self.client.stub = fake_stub
        self.client.exit.set()

        hb = threading.Thread(target=self.client._heartbeat())
        hb.start()
        hb.join()
        fake_stub.heartbeat.assert_called_once()

    def test_op_to_string(self):
        assert SnitchClient.op_to_string(protos.OperationType.OPERATION_TYPE_PRODUCER) == "producer"
        assert SnitchClient.op_to_string(protos.OperationType.OPERATION_TYPE_CONSUMER) == "consumer"
        assert SnitchClient.op_to_string(protos.OperationType.OPERATION_TYPE_UNSET) == "consumer"

    def test_get_pipelines(self):
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

        self.client._attach_pipeline(cmd)
        res = self.client._get_pipelines(op=snitchpy.MODE_CONSUMER, component="test")
        assert len(res) == 0

        res = self.client._get_pipelines(op=snitchpy.MODE_PRODUCER, component="test")
        assert len(res) == 1
        k, v = res.popitem()
        assert v.attach_pipeline.pipeline.id == pipeline_id

    def test_process_success(self):
        wasm_resp = protos.WasmResponse(
            output=b'{"object": {"type": "streamdal"}}',
            exit_code=protos.WasmExitCode.WASM_EXIT_CODE_SUCCESS,
            exit_msg="",
        )
        self.client._call_wasm = mock.MagicMock()
        self.client._call_wasm.return_value = wasm_resp

        cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                service_name="testing",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
            ),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(
                    id=uuid.uuid4().__str__(),
                    steps=[protos.PipelineStep(
                        name="test",
                        on_success=[protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_UNSET],
                        on_failure=[protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_ABORT],
                        detective=protos.steps.DetectiveStep(
                            path="object.type",
                            args=["streamdal"],
                            type=protos.steps.DetectiveType.DETECTIVE_TYPE_STRING_CONTAINS_ANY,
                        )
                    )]
                )
            )
        )

        self.client._attach_pipeline(cmd)

        resp = self.client.process(snitchpy.SnitchRequest(
            data=b'{"object": {"type": "streamdal"}}',
            operation=snitchpy.MODE_PRODUCER,
            component="test",
        ))

        assert resp is not None
        assert resp.error is False
        assert resp.message == ""
        assert resp.data == b'{"object": {"type": "streamdal"}}'

    def test_process_failure(self):
        fake_stub = mock.AsyncMock()

        client = self.client
        client.stub = fake_stub

        wasm_resp = protos.WasmResponse(
            output=b'{}',
            exit_code=protos.WasmExitCode.WASM_EXIT_CODE_FAILURE,
            exit_msg="field not found",
        )
        client._call_wasm = mock.MagicMock()
        client._call_wasm.return_value = wasm_resp

        cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                service_name="testing",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
            ),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(
                    id=uuid.uuid4().__str__(),
                    steps=[protos.PipelineStep(
                        name="test",
                        on_success=[],
                        on_failure=[
                            protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_ABORT,
                            protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_NOTIFY,
                        ],
                        detective=protos.steps.DetectiveStep(
                            path="object.type",
                            args=["batch"],
                            type=protos.steps.DetectiveType.DETECTIVE_TYPE_STRING_CONTAINS_ANY,
                        )
                    )]
                )
            )
        )

        client._attach_pipeline(cmd)

        resp = client.process(snitchpy.SnitchRequest(
            data=b'{"object": {"type": "streamdal"}}',
            operation=snitchpy.MODE_PRODUCER,
            component="test",
        ))

        assert resp is not None
        assert resp.error is True
        assert resp.message == "field not found"
        assert resp.data == b'{"object": {"type": "streamdal"}}'
        fake_stub.notify.assert_called_once()

    def test_process_failure_dry_run(self):
        client = self.client
        client.cfg = SnitchConfig(dry_run=True)

        wasm_resp = protos.WasmResponse(
            output=b'{"object": {"type": "should be replaced by original data on dry run"}}',
            exit_code=protos.WasmExitCode.WASM_EXIT_CODE_FAILURE,
            exit_msg="field not found",
        )
        client._call_wasm = mock.MagicMock()
        client._call_wasm.return_value = wasm_resp

        cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                service_name="testing",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
            ),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(
                    id=uuid.uuid4().__str__(),
                    steps=[protos.PipelineStep(
                        name="test",
                        on_success=[],
                        on_failure=[protos.PipelineStepCondition.PIPELINE_STEP_CONDITION_ABORT],
                        detective=protos.steps.DetectiveStep(
                            path="object.type",
                            args=["batch"],
                            type=protos.steps.DetectiveType.DETECTIVE_TYPE_STRING_CONTAINS_ANY,
                        )
                    )]
                )
            )
        )

        client._attach_pipeline(cmd)

        resp = client.process(snitchpy.SnitchRequest(
            data=b'{"object": {"type": "streamdal"}}',
            operation=snitchpy.MODE_PRODUCER,
            component="test",
        ))

        assert resp is not None
        assert resp.error is False
        assert resp.message == ""
        assert resp.data == b'{"object": {"type": "streamdal"}}'

