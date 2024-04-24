# Streamdal Helm Charts

Helms charts for deploying various Streamdal components on Kubernetes.

## Available Helm Charts

1. **[streamdal-server](./streamdal-server)**
    - Deploy a Streamdal server and console on K8S
1. **[streamdal-operator](./streamdal-operator)**
    - Deploy Streamdal operator used for managing Streamdal server configurations

### Add repo

```bash
helm repo add streamdal https://streamdal.github.io/streamdal/helm-packages
```

### Update repos

```bash
helm repo update
```
