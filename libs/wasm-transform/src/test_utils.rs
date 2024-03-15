use lazy_static::lazy_static;

pub const SAMPLE_JSON: &str = r#"{
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
              "k:{\"name\":\"plumber-cluster\"}": {
                ".": {},
                "f:command": {},
                "f:env": {
                  ".": {},
                  "k:{\"name\":\"PLUMBER_SERVER_CLUSTER_ID\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"PLUMBER_SERVER_ENABLE_CLUSTER\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"PLUMBER_SERVER_NATS_URL\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"PLUMBER_SERVER_NODE_ID\"}": {
                    ".": {},
                    "f:name": {},
                    "f:valueFrom": {
                      ".": {},
                      "f:fieldRef": {}
                    }
                  },
                  "k:{\"name\":\"PLUMBER_SERVER_USE_TLS\"}": {
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
        "name": "plumber-cluster",
        "image": "batchcorp/plumber:v2.1.3",
        "command": [
          "/plumber-linux",
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
            "name": "PLUMBER_SERVER_CLUSTER_ID",
            "value": "7EB6C7FB-9053-41B4-B456-78E64CF9D393"
          },
          {
            "name": "PLUMBER_SERVER_ENABLE_CLUSTER",
            "value": "true"
          },
          {
            "name": "PLUMBER_SERVER_NATS_URL",
            "value": "nats://plumber-nats.default.svc.cluster.local:4222"
          },
          {
            "name": "PLUMBER_SERVER_USE_TLS",
            "value": "false"
          },
          {
            "name": "PLUMBER_SERVER_NODE_ID",
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

lazy_static! {
    pub static ref SAMPLE_JSON_BYTES: Vec<u8> = SAMPLE_JSON.as_bytes().to_vec();
}