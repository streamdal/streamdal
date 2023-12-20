```yaml
name: Publish Helm Chart

on:
  push:
    paths:
      - 'docs/install/helm/**'
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Configure Git
      run: |
        git config user.name "GitHub Actions"
        git config user.email "github-actions@github.com"

    - name: Ensure packages directory exists
      run: |
        mkdir -p install/packages

    - name: Install Helm
      run: |
        curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
        chmod 700 get_helm.sh
        ./get_helm.sh

    - name: Package Helm Chart
      run: |
        helm package install/helm/streamdal-server -d install/packages

    - name: Update Helm repo index
      run: |
        helm repo index install/packages --url https://streamdal.github.io/streamdal/install/packages
        git add install/packages/index.yaml
        git add install/packages/*.tgz

    - name: Push changes
      run: |
        git commit -m "Update Helm chart"
        git push
```
