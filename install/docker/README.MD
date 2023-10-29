Docker Installation Instructions
================================

Installing using this method is one of the easiest ways to get Streamdal running!

1. Make sure you have [Docker](https://docker.com) installed and running
2. Make sure you have [Docker Compose](https://docs.docker.com/compose/) installed
3. Clone this repo
4. `cd streamdal/install/docker`
5. `docker-compose up -d --pull --always-recreate-deps --force-recreate`
6. `docker ps` -- you should see something like:
```bash
❯ docker ps
CONTAINER ID   IMAGE                       COMMAND                  CREATED          STATUS          PORTS                                            NAMES
ed6f02a60db1   streamdal/console:v0.1.26   "/tini -- docker-ent…"   1 day ago   Up 10 minutes   0.0.0.0:8080->8080/tcp                           streamdal-console
75823378255d   docker-envoy                "/usr/local/bin/envo…"   1 day ago   Up 10 minutes   0.0.0.0:8083->8083/tcp, 10000/tcp                streamdal-envoy
aa59c29d9221   streamdal/server:e074107    "/server --debug"        1 day ago   Up 10 minutes   0.0.0.0:8081->8081/tcp, 0.0.0.0:8082->8082/tcp   streamdal-server
750468b0c1bc   redis:latest                "docker-entrypoint.s…"   1 day ago   Up 10 minutes   0.0.0.0:6379->6379/tcp                           streamdal-redis
```

> 🎉 Open `http://localhost:8080` in your browser to see the console! 🎉

[!WARNING]
> This is NOT a recommended _production_ setup!
>
> At minimum, you will want to run at least **two** copies of the server, console
> and envoy containers for redundancy.
> 
> For improving Redis reliability, you will want to follow a separate guide that
> uses [Redis Sentinel](https://redis.io/docs/management/sentinel/).

## Redundancy / High-Availability

The [server](https://github.com/streamdal/server) is distributed by default which
means that you can run any number of server instances.

The only requirements are that you:

* Set a unique `STREAMDAL_SERVER_NODE_NAME` environment variable for each node
  * Ie. `node1`, `node2`, `node3`, etc.
* Set the same `STREAMDAL_SERVER_TOKEN` environment variable for each node

_To learn more about how the server works, check out the [components docs](https://docs.streamdal.com/components)._
