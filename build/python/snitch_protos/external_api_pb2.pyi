from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class CreateStepRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class CreateStepResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class DeletePipelineRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class DeletePipelineResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class DeleteStepRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class DeleteStepResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetPipelineRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetPipelineResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetPipelinesRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetPipelinesResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetServiceRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetServiceResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetServicesRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetServicesResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetStepsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetStepsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class SetPipelineRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class SetPipelineResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class TestRequest(_message.Message):
    __slots__ = ["input"]
    INPUT_FIELD_NUMBER: _ClassVar[int]
    input: str
    def __init__(self, input: _Optional[str] = ...) -> None: ...

class TestResponse(_message.Message):
    __slots__ = ["output"]
    OUTPUT_FIELD_NUMBER: _ClassVar[int]
    output: str
    def __init__(self, output: _Optional[str] = ...) -> None: ...

class UpdateStepRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class UpdateStepResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
