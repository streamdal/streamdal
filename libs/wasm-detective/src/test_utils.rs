use lazy_static::lazy_static;
use protos::sp_pipeline::PipelineDataFormat::PIPELINE_DATA_FORMAT_JSON;
use protos::sp_steps_detective::DetectiveType;
use protos::sp_steps_detective::DetectiveTypePIIKeywordMode::DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET;

use crate::detective::Request;

pub const SAMPLE_JSON: &str = r#"{
    "boolean_t": true,
    "boolean_f": false,
    "object": {
        "ipv4_address": "127.0.0.1",
        "ipv6_address": "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        "mac_address": "00-B0-D0-63-C2-26",
        "uuid_dash": "550e8400-e29b-41d4-a716-446655440000",
        "uuid_colon": "550e8400:e29b:41d4:a716:446655440000",
        "uuid_stripped": "550e8400e29b41d4a716446655440000",
        "number_as_string": "1234",
        "field": "value",
        "empty_string": "",
        "null_field": null,
        "empty_array": [],
        "semver": "1.2.3",
        "valid_hostname": "example.com",
        "invalid_hostname": "-example.com.",
        "email_plain_valid": "test@example.com",
        "email_plain_invalid": "test@example",
        "email_unicode_domain_valid": "test@日本.com",
        "email_unicode_domain_invalid": "test@日本",
        "email_unicode_local_valid": "日本@example.com",
        "email_unicode_local_invalid": "日本@example",
        "credit_card": {
            "visa": {
                "valid": "4111-1111-1111-1111",
                "invalid": "4111111111111112"
            },
            "mastercard": {
                "valid": "5555 5555 5555 4444",
                "invalid": "5555555555554445"
            },
            "amex": {
                "valid": "378282246310005",
                "invalid": "378282246310006"
            },
            "discover": {
                "valid": "6011111111111117",
                "invalid": "6011111111111118"
            },
            "diners_club": {
                "valid": "30569309025904",
                "invalid": "30569309025905"
            },
            "jcb": {
                "valid": "3530111333300000",
                "invalid": "3530111333300001"
            },
            "unionpay": {
                "valid": "6200000000000005",
                "invalid": "6200000000000006"
            },
            "false_positive": "2024-05-30T18:25:47.647138766Z stdout F {"@timestamp":"2024-05-30T18:25:47.647Z","@version":"1","message":"Request: method=GET,path=/api/SE194/condensed","logger_name":"com.streamdal.cache.service.HttpLoggerImpl","thread_name":"http-nio-14444-exec-8","level":"INFO","level_value":20000,"msgId":"d6438565-a83a-4e5f-9a01-d7dea8cae2f3","trace_id":"2f2025462a332f834211856ed6e0d03b","trace_flags":"01","span_id":"c49b93ce47e367cd"}"
        },
        "ssn_valid": "111-22-3456",
        "ssn_invalid": "111-222-3456",
        "arrays": [
            {
                "name": "User1",
                "email": "user1@streamdal.com"
            },
            {
                "name": "User2",
                "email": "user2@streamdal.com"
            }
        ]
    },
    "array": [
        "value1",
        "value2"
    ],
    "number_int": 100,
    "number_float": 100.1,
    "timestamp_unix_str": "1614556800",
    "timestamp_unix_num": 1614556800,
    "timestamp_unix_nano_str": "1614556800000000000",
    "timestamp_unix_nano_num": 1614556800000000000,
    "timestamp_rfc3339": "2023-06-29T12:34:56Z",
    "cloud": {
        "aws": {
            "key_id": "AKIAIOSFODNN7EXAMPLE",
            "mws_auth_token": "amzn.mws.4ea38b7b-f563-7709-4bae-87aea15c"
        },
        "github": {
            "pat": "ghp_qr7jU0ItnCxyvstfROjpYVngNWGidT0SOtwD",
            "fine_grained": "github_pat_11ACDYWHY02q7NV2SZtkr0_CCUemYtLFNSDF0al1gSuLx0drIYZhzlxT2yfsKD6qR9M"
        },
        "docker": {
            "swarm_join_token": "SWMTKN-1-3pu6hszjas19xyp7ghgosyx9k8atbfcr8p2is99znpy26u2lkl-1awxwuwd3z9j1z3puu7rcgdbx",
            "swarm_unlock_token": "SWMKEY-1-7c37Cc8654o6p38HnroywCi19pllOnGtbdZEgtKxZu8"
        },
        "paypal": {
            "braintree_access_token": "access_token$sandbox$3g3w"
        },
        "databricks": {
            "pat": "dapi0a1b2c3d4e5f678901234567890123456a7b"
        },
        "sendgrid": {
            "api_key": "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"
        },
        "azure": {
            "sql_connection_string": "Server=tcp:myserver.database.windows.net,1433;Initial Catalog=mydb;Persist Security Info=False;User ID=mylogin;Password=mypassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
        }
    },
    "payments": {
        "crypto": {
            "eth": "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E",
            "btc": {
                "segwit": "3NW7DCZ13LhXMCLuFsuNmXGR7poLahKJXQ",
                "bech32": "bc1qjvu7n5k9dgwh4ewg5hq7v60yzsspt7k7l4lh45",
                "legacy": "1QA4nSaH2ZEKx5GHZwHDzPQbhdt4gBkzfK"

            },
            "sol": "7MNADbtSvWjuSuJ7mCEEy7m5gP8Kc51tSgkZ1PuSNHW6",
            "xrp": "rNmokJdw1yfMpyJ7F1JVJ62tXzhj35nhv7",
            "xlm": "GDPGF3Q7MGWO5VP6OQ4R54AYFGENKBC32OIWVHX5QMV66CQL5J3HG4GS",
            "xmr": "4831czoX36Xbawh1DGy6Qm5AidNTyDhDfVNxrfghvfsCgfdDCi5BGKpQ7abMyLX3FmZTKj9Q1NXVXL2Dfq17mFFx9qR84rM"
        },
        "routing_number": "122105155",
        "swift_bic": "AAAA-BB-CC-123",
        "iban": "GB82WEST12345698765432",
        "stripe": {
            "secret_key": "sk_live_4eC39HqLyjWDarjtT1zdp7dc"
        }
    },
    "slack": "xoxb-263594206564-FGqddMF8t08v8N7Oq4i57vs1",
    "address": {
        "postal_code": {
            "usa": "12345",
            "canada": "K1A 0B1"
        }
    },
    "personal": {
        "title": "Mr.",
        "religion": "Buddhism",
        "phone": "+13215781234"
    },
    "rsa_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAKj34GkxFhD9\n-----END RSA PRIVATE KEY-----",
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "bearer_token": "Authorization: Bearer testToken123",
    "vehicle": {
        "vin": "4T1G11AKXRU906563"
    },
    "uk": {
        "insurance_number": "AA000000B"
    },
    "ca": {
        "social_insurance_number": "046 454 286"
    }
}"#;

pub const SAMPLE_JSON_K8S: &str = r#"{
  "metadata": {
    "name": "streamdal-cluster-765fdfcc94-kw8qt",
    "generateName": "streamdal-cluster-765fdfcc94-",
    "namespace": "default",
    "uid": "8df7f0f9-4b92-4d6e-a8c7-0776d9adbe12",
    "resourceVersion": "2161476",
    "creationTimestamp": "2024-03-12T17:10:55Z",
    "labels": {
      "app.kubernetes.io/instance": "streamdal",
      "app.kubernetes.io/name": "streamdal-cluster",
      "pod-template-hash": "765fdfcc94"
    },
    "ownerReferences": [
      {
        "apiVersion": "apps/v1",
        "kind": "ReplicaSet",
        "name": "streamdal-cluster-765fdfcc94",
        "uid": "554d22b4-8946-4968-a45a-d3b9f5c40335",
        "controller": true,
        "blockOwnerDeletion": true
      }
    ],
    "managedFields": [
      {
        "manager": "kube-controller-manager",
        "operation": "Update",
        "apiVersion": "v1",
        "time": "2024-03-12T17:10:55Z",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:generateName": {},
            "f:labels": {
              ".": {},
              "f:app.kubernetes.io/instance": {},
              "f:app.kubernetes.io/name": {},
              "f:pod-template-hash": {}
            },
            "f:ownerReferences": {
              ".": {},
              "k:{\"uid\":\"554d22b4-8946-4968-a45a-d3b9f5c40335\"}": {}
            }
          },
          "f:spec": {
            "f:containers": {
              "k:{\"name\":\"streamdal-cluster\"}": {
                ".": {},
                "f:command": {},
                "f:env": {
                  ".": {},
                  "k:{\"name\":\"STREAMDAL_CLUSTER_ID\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"STREAMDAL_ENABLE_CLUSTER\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"STREAMDAL_NODE_ID\"}": {
                    ".": {},
                    "f:name": {},
                    "f:valueFrom": {
                      ".": {},
                      "f:fieldRef": {}
                    }
                  },
                  "k:{\"name\":\"STREAMDAL_USE_TLS\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  }
                },
                "f:image": {},
                "f:imagePullPolicy": {},
                "f:name": {},
                "f:ports": {
                  ".": {},
                  "k:{\"containerPort\":9090,\"protocol\":\"TCP\"}": {
                    ".": {},
                    "f:containerPort": {},
                    "f:protocol": {}
                  }
                },
                "f:resources": {},
                "f:securityContext": {},
                "f:terminationMessagePath": {},
                "f:terminationMessagePolicy": {}
              }
            },
            "f:dnsPolicy": {},
            "f:enableServiceLinks": {},
            "f:restartPolicy": {},
            "f:schedulerName": {},
            "f:securityContext": {},
            "f:serviceAccount": {},
            "f:serviceAccountName": {},
            "f:terminationGracePeriodSeconds": {}
          }
        }
      },
      {
        "manager": "kubelet",
        "operation": "Update",
        "apiVersion": "v1",
        "time": "2024-03-12T17:10:59Z",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:status": {
            "f:conditions": {
              "k:{\"type\":\"ContainersReady\"}": {
                ".": {},
                "f:lastProbeTime": {},
                "f:lastTransitionTime": {},
                "f:status": {},
                "f:type": {}
              },
              "k:{\"type\":\"Initialized\"}": {
                ".": {},
                "f:lastProbeTime": {},
                "f:lastTransitionTime": {},
                "f:status": {},
                "f:type": {}
              },
              "k:{\"type\":\"Ready\"}": {
                ".": {},
                "f:lastProbeTime": {},
                "f:lastTransitionTime": {},
                "f:status": {},
                "f:type": {}
              }
            },
            "f:containerStatuses": {},
            "f:hostIP": {},
            "f:phase": {},
            "f:podIP": {},
            "f:podIPs": {
              ".": {},
              "k:{\"ip\":\"10.244.0.246\"}": {
                ".": {},
                "f:ip": {}
              }
            },
            "f:startTime": {}
          }
        },
        "subresource": "status"
      }
    ]
  },
  "spec": {
    "volumes": [
      {
        "name": "kube-api-access-bjp5b",
        "projected": {
          "sources": [
            {
              "serviceAccountToken": {
                "expirationSeconds": 3607,
                "path": "token"
              }
            },
            {
              "configMap": {
                "name": "kube-root-ca.crt",
                "items": [
                  {
                    "key": "ca.crt",
                    "path": "ca.crt"
                  }
                ]
              }
            },
            {
              "downwardAPI": {
                "items": [
                  {
                    "path": "namespace",
                    "fieldRef": {
                      "apiVersion": "v1",
                      "fieldPath": "metadata.namespace"
                    }
                  }
                ]
              }
            }
          ],
          "defaultMode": 420
        }
      }
    ],
    "containers": [
      {
        "name": "streamdal-cluster",
        "image": "streamdal/streamdal:v1.0.0",
        "command": [
          "/streamdal-linux",
          "server"
        ],
        "ports": [
          {
            "containerPort": 9090,
            "protocol": "TCP"
          }
        ],
        "env": [
          {
            "name": "STREAMDAL_CLUSTER_ID",
            "value": "7EB6C7FB-9053-41B4-B456-78E64CF9D393"
          },
          {
            "name": "STREAMDAL_ENABLE_CLUSTER",
            "value": "true"
          },
          {
            "name": "STREAMDAL_USE_TLS",
            "value": "false"
          },
          {
            "name": "STREAMDAL_NODE_ID",
            "valueFrom": {
              "fieldRef": {
                "apiVersion": "v1",
                "fieldPath": "metadata.name"
              }
            }
          }
        ],
        "resources": {},
        "volumeMounts": [
          {
            "name": "kube-api-access-bjp5b",
            "readOnly": true,
            "mountPath": "/var/run/secrets/kubernetes.io/serviceaccount"
          }
        ],
        "terminationMessagePath": "/dev/termination-log",
        "terminationMessagePolicy": "File",
        "imagePullPolicy": "IfNotPresent",
        "securityContext": {}
      }
    ],
    "restartPolicy": "Always",
    "terminationGracePeriodSeconds": 30,
    "dnsPolicy": "ClusterFirst",
    "serviceAccountName": "demo-cluster",
    "serviceAccount": "demo-cluster",
    "nodeName": "minikube",
    "securityContext": {},
    "schedulerName": "default-scheduler",
    "tolerations": [
      {
        "key": "node.kubernetes.io/not-ready",
        "operator": "Exists",
        "effect": "NoExecute",
        "tolerationSeconds": 300
      },
      {
        "key": "node.kubernetes.io/unreachable",
        "operator": "Exists",
        "effect": "NoExecute",
        "tolerationSeconds": 300
      }
    ],
    "priority": 0,
    "enableServiceLinks": true,
    "preemptionPolicy": "PreemptLowerPriority"
  },
  "status": {
    "phase": "Running",
    "conditions": [
      {
        "type": "Initialized",
        "status": "True",
        "lastProbeTime": null,
        "lastTransitionTime": "2024-03-12T17:10:55Z"
      },
      {
        "type": "Ready",
        "status": "True",
        "lastProbeTime": null,
        "lastTransitionTime": "2024-03-12T17:10:59Z"
      },
      {
        "type": "ContainersReady",
        "status": "True",
        "lastProbeTime": null,
        "lastTransitionTime": "2024-03-12T17:10:59Z"
      },
      {
        "type": "PodScheduled",
        "status": "True",
        "lastProbeTime": null,
        "lastTransitionTime": "2024-03-12T17:10:55Z"
      }
    ],
    "hostIP": "192.168.49.2",
    "podIP": "10.244.0.246",
    "podIPs": [
      {
        "ip": "10.244.0.246"
      }
    ],
    "startTime": "2024-03-12T17:10:55Z",
    "containerStatuses": [
      {
        "name": "streamdal-cluster",
        "state": {
          "running": {
            "startedAt": "2024-03-12T17:10:58Z"
          }
        },
        "lastState": {},
        "ready": true,
        "restartCount": 0,
        "image": "streamdal/streamdal:v1.0.0",
        "imageID": "docker-pullable://streamdal/streamdal@sha256:e4ddcc42e0871559299d0ba16a21a8107f4a20d85c8c5926a6b721c3a07f3c36",
        "containerID": "docker://1e2fc29af1a3289c421cc7e50278c0fda042ecb671ef3478b6e417fe37a93457",
        "started": true
      }
    ],
    "qosClass": "BestEffort"
  }
}"#;

pub const SAMPLE_JSON_PII_KEYWORD: &str = r#"{
    "boolean_t": true,
    "boolean_f": false,
    "object": {
        "ipv4_address": "127.0.0.1",
        "ipv6_address": "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        "mac_address": "00-B0-D0-63-C2-26",
        "uuid_dash": "550e8400-e29b-41d4-a716-446655440000",
        "uuid_colon": "550e8400:e29b:41d4:a716:446655440000",
        "uuid_stripped": "550e8400e29b41d4a716446655440000",
        "number_as_string": "1234",
        "field": "value",
        "empty_string": "",
        "null_field": null,
        "empty_array": [],
        "semver": "1.2.3",
        "valid_hostname": "example.com",
        "invalid_hostname": "-example.com.",
        "email_plain_valid": "test@example.com",
        "email_plain_invalid": "test@example",
        "email_unicode_domain_valid": "test@日本.com",
        "email_unicode_domain_invalid": "test@日本",
        "email_unicode_local_valid": "日本@example.com",
        "email_unicode_local_invalid": "日本@example",
        "credit_card": {
            "visa": {
                "valid": "4111-1111-1111-1111",
                "invalid": "4111111111111112"
            },
            "mastercard": {
                "valid": "5555 5555 5555 4444",
                "invalid": "5555555555554445"
            },
            "amex": {
                "valid": "378282246310005",
                "invalid": "378282246310006"
            },
            "discover": {
                "valid": "6011111111111117",
                "invalid": "6011111111111118"
            },
            "diners_club": {
                "valid": "30569309025904",
                "invalid": "30569309025905"
            },
            "jcb": {
                "valid": "3530111333300000",
                "invalid": "3530111333300001"
            },
            "unionpay": {
                "valid": "6200000000000005",
                "invalid": "6200000000000006"
            }
        },
        "ssn_valid": "111-22-3456",
        "ssn_invalid": "111-222-3456"
    },
    "array": [
        "value1",
        "value2"
    ],
    "number_int": 100,
    "number_float": 100.1,
    "timestamp_unix_str": "1614556800",
    "timestamp_unix_num": 1614556800,
    "timestamp_unix_nano_str": "1614556800000000000",
    "timestamp_unix_nano_num": 1614556800000000000,
    "timestamp_rfc3339": "2023-06-29T12:34:56Z",
    "cloud": {
        "aws": {
            "key_id": "AKIAIOSFODNN7EXAMPLE",
            "mws_auth_token": "amzn.mws.4ea38b7b-f563-7709-4bae-87aea15c"
        },
        "github": {
            "pat": "ghp_qr7jU0ItnCxyvstfROjpYVngNWGidT0SOtwD",
            "fine_grained": "github_pat_11ACDYWHY02q7NV2SZtkr0_CCUemYtLFNSDF0al1gSuLx0drIYZhzlxT2yfsKD6qR9M"
        },
        "docker": {
            "swarm_join_token": "SWMTKN-1-3pu6hszjas19xyp7ghgosyx9k8atbfcr8p2is99znpy26u2lkl-1awxwuwd3z9j1z3puu7rcgdbx",
            "swarm_unlock_token": "SWMKEY-1-7c37Cc8654o6p38HnroywCi19pllOnGtbdZEgtKxZu8"
        },
        "paypal": {
            "braintree_access_token": "access_token$sandbox$3g3w"
        },
        "databricks": {
            "pat": "dapi0a1b2c3d4e5f678901234567890123456a7b"
        },
        "sendgrid": {
            "api_key": "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"
        },
        "azure": {
            "sql_connection_string": "Server=tcp:myserver.database.windows.net,1433;Initial Catalog=mydb;Persist Security Info=False;User ID=mylogin;Password=mypassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
        }
    },
    "payments": {
        "crypto": {
            "eth": "0x1ABC7154748D1CE5144478CDEB574AE244B939B5"
        },
        "routing_number": "122105155",
        "swift_bic": "AAAA-BB-CC-123",
        "iban": "GB82WEST12345698765432",
        "stripe": {
            "secret_key": "sk_live_4eC39HqLyjWDarjtT1zdp7dc"
        }
    },
    "slack": "xoxb-263594206564-FGqddMF8t08v8N7Oq4i57vs1",
    "address": {
        "postal_code": {
            "usa": "12345",
            "canada": "K1A 0B1"
        }
    },
    "personal": {
        "title": "Mr.",
        "religion": "Buddhism",
        "phone": "+13215781234"
    },
    "rsa_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAKj34GkxFhD9\n-----END RSA PRIVATE KEY-----",
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "bearer_token": "Authorization: Bearer testToken123",
    "eMa_iL": "foo@bar.com",
    "lICENSEplate": "abc123",
    "123lic32ense_Plate1234": "def456",
    "ipV4_address": "127.0.0.1",
    "ip_address": "127.0.0.2",
    "ipAddReSS": "127.0.0.3"
    "aws_access_key": "AKIAIOSFODNN7EXAMPLE1",
    "123awsAccessKey456": "AKIAIOSFODNN7EXAMPLE2",
    "1234sEcREt_kEy___": "amzn.mws.4ea38b7b-f563-7709-4bae-87aea15c"
}"#;

lazy_static! {
    pub static ref SAMPLE_JSON_BYTES: Vec<u8> = SAMPLE_JSON.as_bytes().to_vec();
    pub static ref SAMPLE_JSON_K8S_BYTES: Vec<u8> = SAMPLE_JSON_K8S.as_bytes().to_vec();
}

pub struct TestCase<'a> {
    pub request: Request<'a>,
    pub expected_matches: usize,
    pub should_error: bool,
    pub text: String,
}

pub fn run_tests(test_cases: &Vec<TestCase>) {
    for case in test_cases {
        let result = crate::detective::Detective::new().matches(&case.request);

        if case.should_error {
            assert!(result.is_err(), "{}", case.text);
        } else {
            assert_eq!(
                result.unwrap().len(),
                case.expected_matches,
                "{}",
                case.text
            );
        }
    }
}

pub fn generate_request_for_bench(
    detective_type: DetectiveType,
    path: &str,
    args: Vec<String>,
) -> Request {
    Request {
        match_type: detective_type,
        data: &SAMPLE_JSON_BYTES,
        path: path.to_string(),
        args,
        negate: false,
        mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
        data_format: PIPELINE_DATA_FORMAT_JSON,
    }
}
