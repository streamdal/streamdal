import os
import subprocess
import re

# File paths
values_yaml = '../../docs/install/helm/streamdal-server/values.yaml'
deployment_yaml = '../../docs/install/helm/streamdal-server/templates/streamdal-console-deployment.yaml'
docker_compose_yaml = '../../docs/install/docker/docker-compose.yml'
chart_yaml = '../../docs/install/helm/streamdal-server/Chart.yaml'

def get_latest_tag(repository):
    try:
        command = f"curl -s 'https://hub.docker.com/v2/repositories/streamdal/{repository}/tags/?page_size=2' | jq -r '.results[].name' | grep -v latest"
        output = subprocess.check_output(command, shell=True)
        return output.decode('utf-8').strip().split('\n')[-1]
    except subprocess.CalledProcessError as e:
        print(f"Error fetching latest tag for {repository}: {e}")
        return None

def update_file_with_regex(file_path, pattern, new_tag, use_capture_groups=True):
    with open(file_path, 'r') as file:
        content = file.read()

    if use_capture_groups:
        updated_content = re.sub(pattern, lambda match: f'{match.group(1)}{new_tag}{match.group(2)}', content)
    else:
        updated_content = re.sub(pattern, new_tag, content)

    with open(file_path, 'w') as file:
        file.write(updated_content)

def increment_chart_version(file_path):
    with open(file_path, 'r') as file:
        content = file.read()

    new_version = re.sub(
        r'(version: )(\d+)\.(\d+)\.(\d+)',
        lambda match: f"{match.group(1)}{match.group(2)}.{match.group(3)}.{int(match.group(4)) + 1}",
        content
    )

    with open(file_path, 'w') as file:
        file.write(new_version)

if __name__ == "__main__":
    server_tag = get_latest_tag('server')
    console_tag = get_latest_tag('console')

    if server_tag:
        server_image_pattern = r'(  tag: ")[^"]+(")'
        update_file_with_regex(values_yaml, server_image_pattern, f'{server_tag}')
        update_file_with_regex(docker_compose_yaml, r'image: streamdal/server:\S+', f'image: streamdal/server:{server_tag}', use_capture_groups=False)
        print(f"Updated server image tags in {values_yaml} and {docker_compose_yaml} to {server_tag}")

    if console_tag:
        console_image_pattern = r'(image: "streamdal/console:)\S+(" # Fixed the image and tag definition)'
        update_file_with_regex(deployment_yaml, console_image_pattern, f'{console_tag}')
        update_file_with_regex(docker_compose_yaml, r'image: streamdal/console:\S+', f'image: streamdal/console:{console_tag}', use_capture_groups=False)
        print(f"Updated console image tags in {deployment_yaml} and {docker_compose_yaml} to {console_tag}")

    increment_chart_version(chart_yaml)
    print(f"Incremented Helm chart version in {chart_yaml}")
