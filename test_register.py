import pytest
import streamdal.common as common
import streamdal_protos.protos as protos
import uuid
import unittest.mock as mock
from streamdal import StreamdalClient, StreamdalConfig


class TestStreamdalRegisterMethods:
    client: StreamdalClient

    @pytest.fixture(autouse=True)
    def before_each(self):
        client = object.__new__(StreamdalClient)
        client.cfg = StreamdalConfig(service_name="testing")
        client.pipelines = {}
        client.paused_pipelines = {}
        client.log = mock.Mock()

        self.client = client

    def test_attach_pipeline(self):
        """Test set_pipeline adds a pipeline to the pipelines dict"""

        pipeline_id = str(uuid.uuid4())

        cmd = protos.Command(
            audience=protos.Audience(
                component_name="test",
                operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
            ),
            set_pipelines=protos.SetPipelinesCommand(
                pipelines=[
                    protos.Pipeline(
                        id=pipeline_id,
                    )
                ],
            ),
        )

        self.client._set_pipelines(cmd)

        aud_str = common.aud_to_str(cmd.audience)
        assert self.client.pipelines[aud_str] is not None
        assert len(self.client.pipelines[aud_str]) == 1
