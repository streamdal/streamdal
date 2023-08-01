import pytest
import snitch_protos.protos as protos
import snitchpy
import uuid
import unittest.mock as mock
from snitchpy import SnitchClient, SnitchConfig


class TestSnitchRegisterMethods:

    client: SnitchClient

    @pytest.fixture(autouse=True)
    def before_each(self):
        client = object.__new__(SnitchClient)
        client.cfg = SnitchConfig(service_name="testing")
        client.pipelines = {}
        client.paused_pipelines = {}
        client.log = mock.Mock()

        self.client = client

    def test_is_paused(self):
        """Test is_paused returns True when paused"""

        aud = protos.Audience(
            component_name="test",
            operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER
        )

        pipeline_id = uuid.uuid4().__str__()
        aud_str = SnitchClient.audience(aud)
        self.client.paused_pipelines[aud_str] = {}
        self.client.paused_pipelines[aud_str][pipeline_id] = protos.Command

        assert self.client._is_paused(aud, uuid.uuid4().__str__()) is False
        assert self.client._is_paused(aud, pipeline_id) is True

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