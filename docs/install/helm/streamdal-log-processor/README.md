# Streamdal Log Processor

The Streamdal Log Processor Helm chart is used for deploying the log processor component of Streamdal on Kubernetes clusters.

## Prerequisites

- Helm v3+
- Kubernetes cluster 1.16+
- EFS

## Installation

1. Add the Streamdal Helm repository to Helm and install: 

```bash
helm repo add streamdal https://streamdal.github.io/streamdal/helm-packages
helm repo update
log-processor streamdal/log-processor-chart
```


