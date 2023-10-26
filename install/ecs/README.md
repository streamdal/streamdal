# Snitch Stack Deployment

This repository contains CloudFormation templates and related assets for deploying the `snitch-stack` on Amazon ECS using the Fargate launch type.

## Overview

The deployment sets up the following components:

1. **ECS Cluster** named `snitch-stack`.
2. **EFS FileSystem** used for persisting data across container restarts.
3. **Service Discovery** with a `.local` namespace.
4. **NATS** container with JetStream enabled.
5. **Snitch Server** with `envoy-sidecar` for gRPC to HTTP translation.

## Requirements

- AWS CLI installed and configured with the necessary permissions.
- Docker for building and pushing container images.
- Appropriate VPC, Subnet, and Security Group configurations if the defaults are not suitable.

## Deployment

1. Clone this repository:
    ```bash
    git clone streamdal/snitch
    cd snitch/ecs
    ```


2. Deploy the CloudFormation stack:
    ```bash
    aws cloudformation create-stack --stack-name snitch-stack --template-body file://ecs.yml --capabilities CAPABILITY_NAMED_IAM
    ```

## Configuration for New Environments

If you are deploying in a new environment, ensure you update the following in the CloudFormation template:

1. **VPC and Subnet IDs**: Update the default values in the `Parameters` section for `VpcID` and `SubnetID`.

2. **Security Groups**: The template sets up security groups with broad ingress rules. Ensure you review and adjust these to match your security requirements.

3. **Container Images**: Update the container image paths if you're using different registries or image names.

4. **Environment Variables**: Adjust any environment-specific variables such as `SNITCH_SERVER_NATSURL` for the `snitch-server-container`.

5. **Public IP**: By default, the template assigns public IPs to services. If this isn't desired, update the `AssignPublicIp` attribute to `DISABLED`.

6. **Scaling**: The number of task replicas for each service can be adjusted using the `DesiredCount` property in the respective service definitions.

## Cleanup

To delete the stack and all associated resources:

```bash
aws cloudformation delete-stack --stack-name snitch-stack
```
