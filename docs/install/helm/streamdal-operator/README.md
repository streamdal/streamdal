# streamdal-operator

Helm chart for deploying Streamdal operator on Kubernetes used for managing
Streamdal server configurations.

### Pre-requisites

- Helm v3+
- Kubernetes cluster 1.16+

### Install

```bash 
helm install streamdal-operator streamdal/streamdal-operator
```

### Verify Install

1. Verify that the CRD is installed
    ```bash
    kubectl get crd
    ```
    
    Output should look like this:
    
    ```bash
    NAME                                 CREATED AT
    streamdalconfigs.crd.streamdal.com   2024-04-22T23:33:20Z
    ```
 1. Verify that operator is running
    ```bash
    kubectl get pods
    ```
    
    Output should look like this:
    
    ```bash
    NAME                                     READY   STATUS    RESTARTS   AGE
    op-streamdal-operator-5cd6c64d9b-vgsf2   2/2     Running   0          47h
    ```

For additional info, follow the [Streamdal operator README](../../../../apps/operator).

## Sample CR

Part of the operator installation is to also install the `StreamdalConfig` CRD
that you will use to manage configurations on Streamdal servers.

To test the operator, follow these directions:

1. Copy/paste the sample CR into a file (e.g. `sample-config.yaml`)
1. Apply the config to your cluster: `kubectl apply -f sample-config.yaml`
1. Once the CR is applied, you should see the `sample-config` CR in K8S: `kubectl get streamdalconfigs`
1. Inspect the events to see if the CR was successfully processed: `kubectl describe streamdalconfigs sample-config`

**Sample CR**

```yaml
apiVersion: crd.streamdal.com/v1
kind: StreamdalConfig
metadata:
  labels:
    app.kubernetes.io/name: operator
    app.kubernetes.io/managed-by: kustomize
  name: sample-config
spec:
  serverAddress: "streamdal-server:8082"
  serverAuth: "1234"
  configs:
    - name: "config with audiences"
      config: >
        {
            "audiences": [
                {
                    "serviceName": "service5",
                    "operationType": "OPERATION_TYPE_CONSUMER",
                    "operationName": "operationName5",
                    "componentName": "componentName5"
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

<sub>For more sample CRs, see the [apps/operator/config/samples/](../../../../apps/operator/config/samples) 
directory.</sub>

## Misc

To test changes in the helm chart:

`helm install myrelease ./ --debug`
