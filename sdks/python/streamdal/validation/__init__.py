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


def set_pipelines(cmd: protos.Command):
    if not isinstance(cmd, protos.Command):
        raise ValueError("cmd must be a protos.Command")

    if not isinstance(cmd.audience, protos.Audience):
        raise ValueError("cmd.audience must be a protos.Audience")

    if not isinstance(cmd.set_pipelines, protos.SetPipelinesCommand):
        raise ValueError("cmd.set_pipelines must be a protos.SetPipelinesCommand")

    for pipeline in cmd.set_pipelines.pipelines:
        if not isinstance(pipeline, protos.Pipeline):
            raise ValueError("pipeline must be a protos.Pipeline")

        if pipeline.id == "":
            raise ValueError("pipeline.id must be non-empty")


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
