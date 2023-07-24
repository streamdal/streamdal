class SnitchException(Exception):
    """Raised for any exception caused by snitch"""
    pass


class SnitchRegisterException(SnitchException):
    """Raised when a service fails to register with snitch"""
    pass
