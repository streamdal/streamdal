# Snitch Server Helm Chart

This Helm chart deploys the Snitch Server

## Pre-requisites

- Helm v3+
- Kubernetes cluster 1.16+


## Quisk start 

### Add repo

```bash
helm repo add snitch https://streamdal.github.io/snitch/helm-charts/snitch-server
```

### Update repos

```bash
helm repo update
```

### Install

```bash
helm install snitch snitch/snitch-server
```

### View console

Forward the console port and view http://127.0.0.1:3000 in browser 

```bash 
kubectl port-forward svc/snitch-snitch-server-console 3000:3000 
```


## Configuration

Here are the configurable parameters of the Snitch Server Helm chart and their default values:

### Image:
- **Repository**: `streamdal/snitch-server`
- **Pull Policy**: `IfNotPresent`
- **Tag**: `latest`

### Service:
Multiple ports configurations are available:
- **Server**: Port `8080`
- **gRPC**: Port `9090`
- **Envoy**: Port `9091`

### Ingress:

Default ingress is disabled. However, you can enable and customize it as per your needs:

```yaml
ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: ImplementationSpecific
```

### Console Ingress:

Console ingress is also disabled by default, but can be enabled and customized:

```yaml
consoleIngress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: console-example.local
      paths:
        - path: /
          pathType: ImplementationSpecific
```

### Environment Variables:

Default environment variables for configuration:

```yaml
env:
  - name: SNITCH_SERVER_AUTH_TOKEN
    value: "1234"
```

### NATS Configuration:

JetStream and Memory/File storage configurations for NATS:

```yaml
nats:
  config:
    jetstream:
      enabled: true
      memStorage:
        enabled: true
        size: 1Gi
      fileStorage:
        enabled: true
        storageDirectory: /data
        size: 5Gi
```

## Customizing Values

To override the default values, create a `values.yaml` file and then:

```bash
helm install [RELEASE_NAME] snitch/snitch-server-helm -f values.yaml
```

Refer to the default `values.yaml` for possible configuration options.

