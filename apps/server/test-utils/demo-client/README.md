## Demo Client

Simple go utility to demonstrate [Go SDK](https://github.com/streamdal/go-sdk)
usage. 

## IMPORTANT

`demo-client` does **NOT** use vendoring to avoid build issues in docker img
creation workflow.

## Build & Push

```make docker/build```

## Deploy to k8s

```kubectl apply -f deploy.yaml```

