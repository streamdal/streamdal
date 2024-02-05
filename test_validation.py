import pytest
import streamdal.validation as validation
import streamdal_protos.protos as protos


class TestTailRequest:
    cmd: protos.Command

    @pytest.fixture(autouse=True)
    def before_each(self):
        self.cmd = protos.Command()
        self.cmd.tail = protos.TailCommand()
        self.cmd.tail.request = protos.TailRequest()
        self.cmd.tail.request.audience = protos.Audience()
        self.cmd.tail.request.id = "test_id"
        self.cmd.tail.request.type = protos.TailRequestType.TAIL_REQUEST_TYPE_START

    def test_valid_tail_request(self):
        # Should not raise any exception
        validation.tail_request(self.cmd)

    def test_invalid_command_type(self):
        with pytest.raises(ValueError, match="cmd must be a protos.Command"):
            validation.tail_request(None)

    def test_invalid_tail_command_type(self):
        self.cmd.tail = protos.Command()

        with pytest.raises(ValueError, match="cmd.tail must be a protos.TailCommand"):
            validation.tail_request(self.cmd)

    def test_invalid_tail_request_type(self):
        self.cmd.tail.request = protos.Command()

        with pytest.raises(
            ValueError, match="cmd.tail.request must be a protos.TailRequest"
        ):
            validation.tail_request(self.cmd)

    def test_invalid_audience_type(self):
        self.cmd.tail.request.audience = protos.Command()

        with pytest.raises(
            ValueError, match="cmd.tail.request.audience must be a protos.Audience"
        ):
            validation.tail_request(self.cmd)

    def test_empty_request_id(self):
        self.cmd.tail.request.id = ""

        with pytest.raises(ValueError, match="cmd.tail.request.id must be non-empty"):
            validation.tail_request(self.cmd)

    def test_unset_request_type(self):
        self.cmd.tail.request.type = protos.TailRequestType.TAIL_REQUEST_TYPE_UNSET

        with pytest.raises(ValueError, match="cmd.tail.request.type cannot be unset"):
            validation.tail_request(self.cmd)


class TestSetPipelines:
    def test_valid_input(self):
        # Create a valid protos.Command object
        cmd = protos.Command(
            audience=protos.Audience(),
            set_pipelines=protos.SetPipelinesCommand(
                pipelines=[protos.Pipeline(id="some_id")]
            ),
        )

        # The function should not raise any exceptions for valid input
        validation.set_pipelines(cmd)

    def test_invalid_command_type(self):
        with pytest.raises(ValueError, match="cmd must be a protos.Command"):
            validation.set_pipelines(
                None
            )  # Passing a mock object instead of a protos.Command

    def test_invalid_audience_type(self):
        invalid_cmd = protos.Command(
            audience=None,
            set_pipelines=protos.SetPipelinesCommand(
                pipelines=[protos.Pipeline(id="some_id")]
            ),
        )
        with pytest.raises(ValueError, match="cmd.audience must be a protos.Audience"):
            validation.set_pipelines(invalid_cmd)

    def test_invalid_attach_pipeline_type(self):
        invalid_cmd = protos.Command(
            audience=protos.Audience(),
            set_pipelines=None,
        )
        with pytest.raises(
            ValueError,
            match="cmd.set_pipelines must be a protos.SetPipelinesCommand",
        ):
            validation.set_pipelines(invalid_cmd)

    def test_invalid_pipeline_type(self):
        invalid_cmd = protos.Command(
            audience=protos.Audience(),
            set_pipelines=protos.SetPipelinesCommand(pipelines=[protos.Pipeline()]),
        )
        with pytest.raises(ValueError):
            validation.set_pipelines(invalid_cmd)

    def test_empty_pipeline_id(self):
        invalid_cmd = protos.Command(
            audience=protos.Audience(),
            set_pipelines=protos.SetPipelinesCommand(
                pipelines=[protos.Pipeline(id="")]
            ),
        )
        with pytest.raises(ValueError, match="pipeline.id must be non-empty"):
            validation.set_pipelines(invalid_cmd)
