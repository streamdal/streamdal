import streamdal_protos.protos as protos


def tail_request(cmd: protos.Command):
    if not isinstance(cmd, protos.Command):
        raise ValueError("cmd must be a protos.Command")

    if not isinstance(cmd.tail, protos.TailCommand):
        raise ValueError("cmd.tail must be a protos.TailCommand")

    req = cmd.tail.request
    if not isinstance(req, protos.TailRequest):
        raise ValueError("cmd.tail.request must be a protos.TailRequest")

    if not isinstance(req.audience, protos.Audience):
        raise ValueError("cmd.tail.request.audience must be a protos.Audience")

    if req.id == "":
        raise ValueError("cmd.tail.request.id must be non-empty")

    if req.type == protos.TailRequestType.TAIL_REQUEST_TYPE_UNSET:
        raise ValueError("cmd.tail.request.type cannot be unset")


def attach_pipeline(cmd: protos.Command):
    if not isinstance(cmd, protos.Command):
        raise ValueError("cmd must be a protos.Command")

    if not isinstance(cmd.audience, protos.Audience):
        raise ValueError("cmd.audience must be a protos.Audience")

    if not isinstance(cmd.attach_pipeline, protos.AttachPipelineCommand):
        raise ValueError("cmd.attach_pipeline must be a protos.AttachPipelineCommand")

    if not isinstance(cmd.attach_pipeline.pipeline, protos.Pipeline):
        raise ValueError("cmd.attach_pipeline.pipeline must be a protos.Pipeline")

    if cmd.attach_pipeline.pipeline.id == "":
        raise ValueError("cmd.attach_pipeline.pipeline.id must be non-empty")


def detach_pipeline(cmd: protos.Command):
    if not isinstance(cmd, protos.Command):
        raise ValueError("cmd must be a protos.Command")

    if not isinstance(cmd.audience, protos.Audience):
        raise ValueError("cmd.audience must be a protos.Audience")

    if not isinstance(cmd.detach_pipeline, protos.DetachPipelineCommand):
        raise ValueError("cmd.detach_pipeline must be a protos.DetachPipelineCommand")

    if cmd.detach_pipeline.pipeline_id == "":
        raise ValueError("cmd.detach_pipeline.pipeline.id must be non-empty")


def pause_pipeline(cmd: protos.Command):
    if not isinstance(cmd, protos.Command):
        raise ValueError("cmd must be a protos.Command")

    if not isinstance(cmd.audience, protos.Audience):
        raise ValueError("cmd.audience must be a protos.Audience")

    if not isinstance(cmd.pause_pipeline, protos.PausePipelineCommand):
        raise ValueError("cmd.pause_pipeline must be a protos.PausePipelineCommand")

    if cmd.pause_pipeline.pipeline_id == "":
        raise ValueError("cmd.pause_pipeline.pipeline.id must be non-empty")


def resume_pipeline(cmd: protos.Command):
    if not isinstance(cmd, protos.Command):
        raise ValueError("cmd must be a protos.Command")

    if not isinstance(cmd.audience, protos.Audience):
        raise ValueError("cmd.audience must be a protos.Audience")

    if not isinstance(cmd.resume_pipeline, protos.ResumePipelineCommand):
        raise ValueError("cmd.resume_pipeline must be a protos.ResumePipelineCommand")

    if cmd.resume_pipeline.pipeline_id == "":
        raise ValueError("cmd.resume_pipeline.pipeline.id must be non-empty")


def kv_command(cmd: protos.Command):
    if not isinstance(cmd, protos.Command):
        raise ValueError("cmd must be a protos.Command")


def kv_instruction(i: protos.KvInstruction):
    if not isinstance(i, protos.KvInstruction):
        raise ValueError("instruction must be a protos.KvInstruction")

    if i.action == protos.shared.KvAction.KV_ACTION_UNSET:
        raise ValueError("instruction.action cannot be unset")

    if i.action != protos.shared.KvAction.KV_ACTION_DELETE_ALL and not isinstance(
        i.object, protos.KvObject
    ):
        raise ValueError("instruction.object cannot be unset")
