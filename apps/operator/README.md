# operator
Kubernetes operator used that manages Streamdal configurations.

## Overview
This operator will install a CRD that will allow you to manage Streamdal configurations
using a CR that looks like this:

```yaml
apiVersion: crd.streamdal.com/v1
kind: StreamdalConfig
metadata:
  labels:
    app.kubernetes.io/name: operator
  name: sample-config
spec:
  serverAddress: "streamdal-server-address:8082"
  serverAuth: "1234"
  configs:
    - name: "Full config example"
      config: >
        {
            "audiences": [
                {
                    "serviceName": "service5",
                    "operationType": "OPERATION_TYPE_CONSUMER",
                    "operationName": "operationName5",
                    "componentName": "componentName5"
                },
                {
                    "serviceName": "service6",
                    "operationType": "OPERATION_TYPE_CONSUMER",
                    "operationName": "operationName6",
                    "componentName": "componentName6"
                }
            ],
            "notifications": [
                {
                    "id": "c746e19d-171c-4521-9a2d-bb456624acaa-1",
                    "name": "Test slack Integration",
                    "type": "NOTIFICATION_TYPE_SLACK",
                    "slack": {
                        "botToken": "test-token",
                        "channel": "test-channel"
                    }
                }
            ],
            "pipelines": [
                {
                    "id": "a027f81c-fd90-45f6-9f38-962426c768eb",
                    "name": "mypipeline-foo3",
                    "steps": [
                        {
                            "name": "Step #1",
                            "onFalse": {
                                "abort": "ABORT_CONDITION_ABORT_CURRENT"
                            },
                            "detective": {
                                "path": "object.field",
                                "negate": false,
                                "type": "DETECTIVE_TYPE_HAS_FIELD"
                            },
                            "WasmId": "06f21173-1008-c99b-2bb5-452ffa84b3d5"
                        },
                        {
                            "name": "Step #2",
                            "transform": {
                                "type": "TRANSFORM_TYPE_MASK_VALUE",
                                "maskOptions": {
                                    "path": "object.field"
                                }
                            },
                            "WasmId": "50adafdc-d17f-9caa-3d9d-f951ddc42819"
                        }
                    ]
                }
            ],
            "audienceMappings": {
                "service5:operation_type_consumer:operationname5:componentname5": {
                    "configs": [
                        {
                            "id": "a027f81c-fd90-45f6-9f38-962426c768eb"
                        }
                    ]
                }
            }
        }
```

The operator will ensure any changes to `StreamdalConfig` CRs are reflected in 
the Streamdal server configuration.

In addition to updating configurations every time a `kubectl apply -f ...` is ran,
, the operator will also periodically compare wanted state in the CRs and the 
actual state in the server and update as necessary.

The periodic check occurs every **10s**. This can be changed by setting a
`PERIODIC_REONCILER_INTERVAL` environment variable in the operator deployment
to a Golang-compatible duration string (`30s`, `1m`, `1h`, etc.).

## Installation

The operator consists of several components (manager, rbac proxy, CRD) and while
it is possible to install each component individually, it is recommended to use
the install methods outlined below.

* **Install operator via a [helm chart](https://helm.sh)**

```bash
helm install ...
```

_OR_

* **Install using `kubectl`**

Use `kubectl` to apply the install manifest in [deploy/install.yaml](dist/install.yaml):

```bash
kubectl apply -f dist/install.yaml

# Or if you don't have this repo checked out locally

kubectl apply -f https://raw.githubusercontent.com/streamdal/streamdal/main/apps/operator/dist/install.yaml
``` 

_OR_

* **Using `make`**

If you have this repo checked out, you can use `make` to install/deploy the
operator to the current k8s cluster. 

```bash
make deploy IMG=streamdal/operator:latest
```

## Uninstall
You can uninstall the operator by doing any of the following:

* `helm uninstall <TODO>`
* `kubectl delete -f dist/install.yaml`
* `kubectl delete -f https://raw.githubusercontent.com/streamdal/streamdal/main/apps/operator/dist/install.yaml`
* `make undeploy`

## Troubleshooting

- The operator will be installed to the `operator-system` namespace.
    ```bash
    > kubectl get pods -n operator-system
    NAME                                           READY   STATUS    RESTARTS   AGE
    operator-controller-manager-5cd6c64d9b-vgsf2   2/2     Running   0          87s
    ```

- The operator has two containers in the pod - a `kube-rbac-proxy` container and a
`manager` container. Operator logs would be found in the `manager` container.

- The operator is H/A with built-in leader election. If operator 1 dies,
operator 2 will take over (and k8s will bring up a replacement operator pod for
the failed operator).

## For Developers

* You can build and push an operator image by doing:]
    ```bash
    make docker-build IMG=streamdal/operator:latest
    make docker-push IMG=streamdal/operator:latest
    ```

* Use the following flow when developing the operator:
    1. Make changes to operator code
    1. If you make any changes to the CRD, run `make manifests`<sub>This will
        generate the CRD yaml file in `config/crd/bases/`</sub>
    1. If you make any changes to the CRD, run `make install` <sub>This will
       install the CRD to the local cluster</sub>
    1. Run `make run` to run the operator locally
    1. Make changes to a sample StreamdalConfig CR and apply them to the cluster:
        ```bash
        kubectl apply -f config/samples/streamdal_v1_streamdalconfig.yaml
        # Observe operator logs to see how it reacts to the CR changes
        ```
    1. When satisfied with changes -> PR. On merge to `main`, Github Actions will
       build and push a new operator image `streamdal/operator` image with 
       `latest` and `8-char-commit-sha` tags.
