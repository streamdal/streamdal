# Snitch Stack Deployment

This repository contains CloudFormation templates and related assets for deploying the `snitch-stack` on Amazon ECS using the Fargate launch type.

## Overview

The deployment sets up the following components:

1. **ECS Cluster** named `streamdal-server-deployment`.
2. **EFS FileSystem** used for persisting redis data across container restarts.
3. **Service Discovery** with a `.local` namespace.
4. **Redis** container.
5. **Streamdal Server** with `envoy-sidecar` for gRPC to HTTP translation.

## Requirements

- AWS CLI installed and configured with the necessary permissions.
- Docker for building and pushing container images.
- Appropriate VPC, Subnet, and Security Group configurations if the defaults are not suitable.
- A subnet in the VPC with outbound internet connection 

## Deployment

1. Clone this repository:
    ```bash
    git clone streamdal/streamdal
    cd streamdal/docs/install/ecs
    ```

2. Edit ecs-private.yml update the parameters to match your AWS VPC 

3. Deploy the CloudFormation stack:
    ```bash
     ./deploy.sh
    ```
4. Test from inside the vpc 

```
  docker run -d \
  --name signup-service-verifier \
  streamdal/demo-client:3ddcff71 \
  -d \
  --message-rate=10,20 \
  --service-name=signup-service \
  --server-address=streamdal-server.local:8082 \
  --operation-type=2 \
  --operation-name=verifier \
  --component-name=postgresql \
  --data-source-type=file \
  --data-source-file=/assets/sample-signup-producer.json
```

5. Navigate to  console in a browser  on port 8080 using the IP assigned via ECS


## Configuration for New Environments

If you are deploying in a new environment, ensure you update the following in the CloudFormation template:

1. **VPC and Subnet IDs**: Update the default values in the `Parameters` section for `VpcID` and `SubnetID`.

2. **Security Groups**: The template sets up security groups with broad ingress rules. Ensure you review and adjust these to match your security requirements.

3. **Container Images**: Update the container image paths if you're using different registries or image names.

4. **Scaling**: The number of task replicas for each service can be adjusted using the `DesiredCount` property in the respective service definitions.

## Cleanup

To delete the stack and all associated resources:

```bash
aws cloudformation delete-stack --stack-name streamdal-server-deployment
```
