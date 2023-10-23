import streamdal_protos.protos as protos


def aud_to_str(aud: protos.Audience) -> str:
    """Convert an Audience to a string"""
    return "{}.{}.{}.{}".format(
        aud.service_name, aud.component_name, aud.operation_type, aud.operation_name
    )


def str_to_aud(aud: str) -> protos.Audience:
    """Convert a string to an Audience"""
    parts = aud.split(".")
    return protos.Audience(
        service_name=parts[0],
        operation_type=protos.OperationType(int(parts[2])),
        operation_name=parts[3],
        component_name=parts[1],
    )
