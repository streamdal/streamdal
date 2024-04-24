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

### Verify Streamdal repo

```bash
helm search repo streamdal
```

You should see something like:

```bash
NAME                        	CHART VERSION	APP VERSION	DESCRIPTION
streamdal/streamdal-operator	0.1.0        	0.1.0      	A Helm chart for Kubernetes
streamdal/streamdal-server  	0.1.54       	0.0.4      	A Helm chart for Kubernetes
```
