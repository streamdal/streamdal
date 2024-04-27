<div align="center">
   
<img src="./assets/streamdal-logo-dark.png#gh-dark-mode-only"><img src="./assets/streamdal-logo-light.png#gh-light-mode-only">  

[![GitHub](https://img.shields.io/github/license/streamdal/streamdal)](https://github.com/streamdal/streamdal)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

</div>  

## Streamdal-enabled Log Proecssor for Logstash

## Local Development
In order to do local dev, `log-processor` requires `logstash` and the Streamdal
`server` to be up and running. Easiest way to do this is to use `docker-compose`:

```bash
docker-compose up -d logstash streadal-server streamdal-redis
```

Run the log-processor: `go run main.go`

### Without Logstash
It is possible to "fake" running a logstash server. To do this, install `socat` 
(`brew install socat` on macOS), open two extra terminals.

First, launch a listener on port 6001 that `log-processor` will connect to, as
if it was the Logstash server.

```bash
# In terminal 1
socat -d -d TCP-LISTEN:6001,fork,reuseaddr
```

You  can now run `log-processor` and it will connect to the `socat` listener,
as if it was the Logstash server.

Last, open a connection to `log-processor` listen address. You will use this to
mimic logstash sending logs to log-processor.

```bash
# In terminal 2 
nc localhost 6000
```

You can now send a Logstash formatted JSON message on port `6000` and see how
the `log-processor` will handle it.

Once the `log-processor` is finished processing the message, it will send it to
back to Logstash on port `6001`.

### Generate Logs

Several scripts are included to generate dummy logs to test `log-processor`.

Example:

```bash
./scripts/generate-file-logs.sh --num-lines 100 logs/input/foodir 
```

Will generate the "foodir" directory and generate a file under it named `$randomString.log`
with 100 lines of dummy logs.

# Community

We're building Streamdal in the open and we'd love for you to join us!

Join our [Discord](https://discord.gg/streamdal)!
