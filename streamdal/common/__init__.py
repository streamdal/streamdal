"""
This module contains methods common to multiple sub-modules of the streamdal package.
"""

import streamdal_protos.protos as protos
from wasmtime import Memory


class StreamdalException(Exception):
    """Raised for any exception caused by python-sdk"""

    pass


def aud_to_str(aud: protos.Audience) -> str:
    """Convert an Audience to a string"""
    return "{}.{}.{}.{}".format(
        aud.service_name, aud.component_name, aud.operation_type, aud.operation_name
    ).lower()


def str_to_aud(aud: str) -> protos.Audience:
    """Convert a string to an Audience"""
    parts = aud.lower().split(".")
    return protos.Audience(
        service_name=parts[0],
        operation_type=protos.OperationType(int(parts[2])),
        operation_name=parts[3],
        component_name=parts[1],
    )


def read_memory(memory: Memory, store, result_ptr: int, length: int = -1) -> bytes:
    """
    Read a response from a wasm memory buffer using the given length,
    or until we encounter 3 null bytes in a row.
    """
    mem_len = memory.data_len(store)

    # Ensure we aren't reading out of bounds
    if result_ptr > mem_len or result_ptr + length > mem_len:
        raise StreamdalException("WASM memory pointer out of bounds")

    # TODO: can we avoid reading the entire buffer somehow?
    result_data = memory.read(store, result_ptr, mem_len)

    res = bytearray()  # Used to build our result
    nulls = 0  # How many null pointers we've encountered
    count = 0  # How many bytes we've read, used to check against length, if provided

    for v in result_data:
        if length == count and length != -1:
            break

        if nulls == 3:
            break

        if v == 166:
            nulls += 1
            res.append(v)
            continue

        count += 1
        res.append(v)
        nulls = 0  # Reset nulls since we read another byte and thus aren't at the end

    if count == len(result_data) and nulls != 3:
        raise StreamdalException(
            "unable to read response from wasm - no terminators found in response data"
        )

    return bytes(res).rstrip(b"\xa6")
