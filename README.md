
# Snitch Project Repository

This repository houses various components and configurations for the Snitch project.

## Directory Structure

- `cloud-formations`: Contains AWS CloudFormation templates for provisioning cloud resources related to the Snitch project.
  
- `docker`: Contains Docker and Docker Compose configurations for deploying and running the Snitch project locally or on any Docker-enabled environment.
  
- `helm-charts`: Houses Helm charts for deploying the Snitch project on Kubernetes clusters.

## Getting Started

### Cloud Formations

Navigate to the `cloud-formations` directory to find AWS CloudFormation templates. These templates can be used to create or update cloud resources as needed.

```bash
cd cloud-formations
```

Follow the individual README files within for detailed instructions on how to use each template.

### Docker Deployment

For local development or testing, the Snitch project can be deployed using Docker Compose. Navigate to the `docker` directory:

```bash
cd docker
```

Follow the README within for detailed instructions on how to build and run the services using Docker.

### Helm Charts

To deploy the Snitch project on a Kubernetes cluster, Helm charts are provided in the `helm-charts` directory:

```bash
cd helm-charts
```

The charts are organized by individual components. Follow the README files within each chart directory for instructions on how to deploy them.

## Contributing

Feel free to submit pull requests or raise issues if you find any. Ensure that your contributions align with the project's coding standards and guidelines.

## License

This project is licensed under the MIT License. Please see the `LICENSE` file for more details.
