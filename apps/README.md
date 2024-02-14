Apps
====
This directory contains apps that are used in the Streamdal ecosystem.
 
* [cli](./cli)
  * CLI/terminal UI 
* [console](./console)
  * Web-based UI
* [docs](./docs)
  * Astro app used for https://docs.streamdal.com
* [server](./server)
  * Server component

## Usage - For Users
You do not need to use these directly - you can install all of the components
via curl-bash `curl -sSL https://sh.streamdal.com | bash` or run the stack
manually via `docker-compose` (see [../docs/install/docker](../docs/install/docker)).

## Usage - For Developers
To run these apps locally, clone the repo, `cd` into the `apps` directory and
run `make help` to see the available commands.
