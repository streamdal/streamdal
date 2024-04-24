# streamdal-operator

Helm chart for deploying Streamdal operator on Kubernetes used for managing
Streamdal server configurations.

### Pre-requisites

- Helm v3+
- Kubernetes cluster 1.16+

### Install

```bash
# For streamdal server
helm install streamdal streamdal/streamdal-server
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
    kubectl get pods -n operator-system
    ```
    
    Output should look like this:
    
    ```bash
    NAME                                           READY   STATUS    RESTARTS   AGE
    operator-controller-manager-5cd6c64d9b-vgsf2   2/2     Running   0          47h
    ```

For additional info, follow the [Streamdal operator README](../../../../apps/operator).
