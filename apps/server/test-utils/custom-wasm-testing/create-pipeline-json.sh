#!/usr/bin/env bash
#

grpcurl -plaintext -H "auth-token: 1234" -d @ localhost:8082 protos.External/CreatePipeline <<EOM
{
    "pipelineJson": "ewogICAgImlkIjogIjI1NmQ2NjNhLWFmZjYtNGE4Yy1hMjAwLTFmNjkyYjJhMTBkMyIsCiAgICAibmFtZSI6ICJQaXBlbGluZV9OYW1lIiwKICAgICJzdGVwcyI6IFsKICAgICAgICB7CiAgICAgICAgICAgICJuYW1lIjogImRldGVjdGl2ZSBoYXMgc3RlcCBmaWVsZCIsCiAgICAgICAgICAgICJvbkZhbHNlIjogewogICAgICAgICAgICAgICAgImFib3J0IjogIkFCT1JUX0NPTkRJVElPTl9BQk9SVF9DVVJSRU5UIgogICAgICAgICAgICB9LAogICAgICAgICAgICAiZGV0ZWN0aXZlIjogewogICAgICAgICAgICAgICAgInBhdGgiOiAib2JqZWN0LmZpZWxkIiwKICAgICAgICAgICAgICAgICJuZWdhdGUiOiBmYWxzZSwKICAgICAgICAgICAgICAgICJ0eXBlIjogIkRFVEVDVElWRV9UWVBFX0hBU19GSUVMRCIKICAgICAgICAgICAgfQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgICAibmFtZSI6ICJjdXN0b20gd2FzbSBzdGVwIiwKICAgICAgICAgICAgIm9uRmFsc2UiOiB7CiAgICAgICAgICAgICAgICAiYWJvcnQiOiAiQUJPUlRfQ09ORElUSU9OX0FCT1JUX0NVUlJFTlQiCiAgICAgICAgICAgIH0sCiAgICAgICAgICAgICJjdXN0b20iOiB7CiAgICAgICAgICAgICAgICAiYXJncyI6IHsKICAgICAgICAgICAgICAgICAgICAiYXJnMSI6ICJkbUZzZFdVeENnPT0iCiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0sCiAgICAgICAgICAgICJXYXNtSWQiOiAiNmEwNjgxOTUtZjJkYS04ZDcxLTQ3NzktMmU4ZWU1OWYyZDc4IgogICAgICAgIH0KICAgIF0KfQo="
}
EOM
