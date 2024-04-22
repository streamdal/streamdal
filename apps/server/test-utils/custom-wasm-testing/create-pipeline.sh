#!/usr/bin/env bash
#

grpcurl -plaintext -H "auth-token: 1234" -d @ localhost:8082 protos.External/CreatePipeline <<EOM
{
    "pipeline": {
        "id": "256d663a-aff6-4a8c-a200-1f692b2a10d3",
        "name": "Pipeline_Name",
        "steps": [
            {
                "name": "detective has step field",
                "onFalse": {
                    "abort": "ABORT_CONDITION_ABORT_CURRENT"
                },
                "detective": {
                    "path": "object.field",
                    "negate": false,
                    "type": "DETECTIVE_TYPE_HAS_FIELD"
                }
            },
            {
                "name": "custom wasm step",
                "onFalse": {
                    "abort": "ABORT_CONDITION_ABORT_CURRENT"
                },
                "custom": {
                    "args": {
                        "arg1": "dmFsdWUxCg=="
                    }
                },
                "WasmId": "6a068195-f2da-8d71-4779-2e8ee59f2d78"
            }
        ]
    }
}
EOM
