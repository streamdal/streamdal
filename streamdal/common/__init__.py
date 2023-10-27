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


def read_memory(memory: Memory, store, result_ptr: int, length: int = None) -> bytes:
    """
    This function has three operation modes:

    1. If you pass a $ptr and $length - it will try to read $length bytes from the $ptr
    2. If you pass a ptr and pass length as -1 - it will try to unpack size from the $ptr
    3. If you pass a ptr and do NOT pass length - it will read all memory starting at $ptr
    """
    mem_len = memory.data_len(store)

    if length is None:
        ptr_true = result_ptr
        len_true = mem_len
    elif length == -1:
        ptr_true = result_ptr >> 32
        len_true = result_ptr & 0xFFFFFFFF
    else:
        ptr_true = result_ptr
        len_true = length

    # Ensure we aren't reading out of bounds (if we have a real length)
    # if length is not None or length != -1 and ptr_true > len_true or ptr_true + len_true > mem_len:
    #     raise StreamdalException("WASM memory pointer out of bounds")

    return memory.read(store, ptr_true, ptr_true + len_true)
