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


class TestAttachPipeline:
    def test_valid_input(self):
        # Create a valid protos.Command object
        cmd = protos.Command(
            audience=protos.Audience(),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(id="some_id")
            ),
        )

        # The function should not raise any exceptions for valid input
        validation.attach_pipeline(cmd)

    def test_invalid_command_type(self):
        with pytest.raises(ValueError, match="cmd must be a protos.Command"):
            validation.attach_pipeline(
                None
            )  # Passing a mock object instead of a protos.Command

    def test_invalid_audience_type(self):
        invalid_cmd = protos.Command(
            audience=protos.Command(),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(id="some_id")
            ),
        )
        with pytest.raises(ValueError, match="cmd.audience must be a protos.Audience"):
            validation.attach_pipeline(invalid_cmd)

    def test_invalid_attach_pipeline_type(self):
        invalid_cmd = protos.Command(
            audience=protos.Audience(), attach_pipeline=protos.Command()
        )
        with pytest.raises(
            ValueError,
            match="cmd.attach_pipeline must be a protos.AttachPipelineCommand",
        ):
            validation.attach_pipeline(invalid_cmd)

    def test_invalid_pipeline_type(self):
        invalid_cmd = protos.Command(
            audience=protos.Audience(),
            attach_pipeline=protos.AttachPipelineCommand(pipeline=protos.Pipeline()),
        )
        with pytest.raises(ValueError):
            validation.attach_pipeline(invalid_cmd)

    def test_empty_pipeline_id(self):
        invalid_cmd = protos.Command(
            audience=protos.Audience(),
            attach_pipeline=protos.AttachPipelineCommand(
                pipeline=protos.Pipeline(id="")
            ),
        )
        with pytest.raises(
            ValueError, match="cmd.attach_pipeline.pipeline.id must be non-empty"
        ):
            validation.attach_pipeline(invalid_cmd)
