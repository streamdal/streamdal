<div align="center">
   
<img src="./assets/img/streamdal-logo-dark.png#gh-dark-mode-only"><img src="./assets/img/streamdal-logo-light.png#gh-light-mode-only">  

[![GitHub](https://img.shields.io/github/license/streamdal/streamdal)](https://github.com/streamdal/streamdal)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

</div>  

Streamdal is an open-source _**'Code Native Data Pipeline'**_ solution for 
running data tasks _directly_ in your application code.

It is at least _10x faster_, _10x cheaper_ and _10x easier_ to operate than
traditional data pipelines.

----

<sub>_This is what it looks like:_</sub>
<img src="assets/img/console.png">

<div align="center">

[Manifesto](#manifesto) •
[Benefits](#benefits) •
[Demo](#live-demo) •
[Getting Started](#getting-started) •
[How Does It Work?](#how-does-it-work) •
[Community](#community) •
[Resources](#resources)

</div>

# Benefits

There are major benefits to running pipelines directly within your app:

* **Eliminates** the need for a separate data pipeline infrastructure
   * Pipelines execute from within your app, using existing compute that your
     app is already using
* **Eliminates** the need for a separate data pipeline team
   * No more waiting for the data pipeline team to make pipeline changes
* Is **ridiculously** fast
   * Streamdal uses Wasm to execute pipelines at near-native speeds
* Is **actually** real-time
   * Not "near real-time" or "max-30-seconds-real-time" - but _actually_
     real-time - data is processed as soon as your app reads or writes data
* [And **many** other reasons](https://docs.streamdal.com/en/getting-started/use-cases/)

# Live Demo

You don't have to install the [server](https://github.com/streamdal/streamdal/tree/main/apps/server), the [console](https://github.com/streamdal/streamdal/tree/main/apps/console) or [instrument](https://docs.streamdal.com/en/guides/instrumentation/)
any of your apps to see Streamdal in action. We've got a live demo :)

### [DEMO.STREAMDAL.COM](https://demo.streamdal.com)

_The demo showcases:_

1. **Real-time Data Transformation**
   * View how the `Mask dot com emails` pipeline for `welcome service` 
     obfuscates `recipient` field if the field contains `.com`
2. **Real-time Masking & Obfuscation**
   * Observe the `Scrub ICMP` pipeline mask `object.ipv4_address` if 
     `object.protocol` equals "ICMP"
3. **Improved Debug Via "tail-like" UI**
    * Select any Component and start `Tail` request to watch live output
4. **Real-time Performance Insights**
    * Watch the read/write-per-second throughput for any component
5. **See All Services in Your Stack**
    * Use the service map (data graph) UI to get a bird's eye view of all
      services and components and how they relate to each other.
    * The [data graph](https://docs.streamdal.com/en/resources-support/glossary/#data-graph) is the "node map" of all services and components
6. **Real-time Schema Inference**
    * All consumers and producers automatically infer the schemas of the payloads
      they read and write.
    * View the inferred schema to catch any unexpected changes, ensure data 
      quality or just get a better understanding of the data your services are
      reading and writing.

<sub>_You can read more about how this is achieved in the ["how does it work?"](https://docs.streamdal.com/en/getting-started/how-streamdal-works/) docs._</sub>

# Getting Started

Getting started consists of two steps:

1. **Installing** the server, console and their dependencies
2. **Instrumenting** your code with one of our [SDKs](https://docs.streamdal.com/en/core-components/sdk/)

### Install

The _easiest_ way to get Streamdal running is via `curl | bash`:

```
curl -sSL https://sh.streamdal.com | bash
```

1. The install script will verify that you have `git`, `docker` and `docker-compose` installed
2. The install script will clone this repo to `~/streamdal`
3. The install script will bring up all components via `docker-compose`

Once done:

🎉 **Open`http://localhost:8080` in your browser!** 🎉

You should be presented with a _beautiful_ (but empty) UI! To populate it,
we will need to instrument some code. _Onto the next section!_

<sub>_For alternative installation methods, check the [docs](./docs) dir._</sub>

### Instrument

Once you've installed the server and console, you can instrument your code using
one of our SDKs:

- [Go](https://github.com/streamdal/streamdal/tree/main/sdks/go) ━ [ꜜExample](#go)
- [Python](https://github.com/streamdal/streamdal/tree/main/sdks/python) ━ [ꜜExample](#python)
- [Node](https://github.com/streamdal/streamdal/tree/main/sdks/node) ━ [ꜜExample](#nodejs)

> To see an example of a _complete_ instrumentation, take a look at the
[Go demo client](./apps/server/test-utils/demo-client/) 
> that is bundled with the [./apps/server](./apps/server/test-utils/demo-client/).

#### [Go](https://github.com/streamdal/streamdal/tree/main/sdks/go)
```go
package main

import (
   "context"

   "github.com/streamdal/go-sdk"
)

func main() {
   sc, _ := streamdal.New(&streamdal.Config{
      ServerURL:       "streamdal-server.svc.cluster.local:8082",
      ServerToken:     "1234",
      ServiceName:     "billing-svc",
      ShutdownCtx:     context.Background(),
   })

   resp, _ := sc.Process(context.Background(), &streamdal.ProcessRequest{
      OperationType: streamdal.OperationTypeConsumer,
      OperationName: "new-order-topic",
      ComponentName: "kafka",
      Data:          []byte(`{"object": {"field": true}}`),
   })
}
```

#### [Python](https://github.com/streamdal/streamdal/tree/main/sdks/python)
```python
from streamdal import (OPERATION_TYPE_CONSUMER, ProcessRequest, StreamdalClient, StreamdalConfig)

client = StreamdalClient(
   cfg=StreamdalConfig(
      service_name="order-ingest",
      streamdal_url="streamdal-server.svc.cluster.local:8082",
      streamdal_token="1234",
   )
)

res = client.process(
   ProcessRequest(
      operation_type=OPERATION_TYPE_CONSUMER,
      operation_name="new-order-topic",
      component_name="kafka",
      data=b'{"object": {"field": true}}',
   )
)
```

#### [Node.js](https://github.com/streamdal/streamdal/tree/main/sdks/node)
```typescript
import { OperationType, Streamdal } from "@streamdal/node-sdk";

export const example = async () => {
  const streamdal = new Streamdal({
    streamdalUrl: "localhost:8082",
    streamdalToken: "1234",
    serviceName: "test-service-name",
    pipelineTimeout: "100",
    stepTimeout: "10",
  });

  const result = await streamdal.processPipeline({
    audience: {
      serviceName: "test-service",
      componentName: "kafka",
      operationType: OperationType.PRODUCER,
      operationName: "kafka-producer",
    },
    data: new TextEncoder().encode(JSON.stringify({ key: "value" })),
  });
};

```  

  
> [!IMPORTANT]
> **These are _basic, minimal_ examples and should NOT be used in production code.**
> 
> Refer to the [instrumentation docs](https://docs.streamdal.com/en/guides/instrumentation/) for more thorough directions.

# How Does It Work?

Streamdal consists of **three** main components:

- **[Server](https://github.com/streamdal/streamdal/tree/main/apps/server)**
- **[Console](https://github.com/streamdal/streamdal/tree/main/apps/console)**
- **[SDKs](https://docs.streamdal.com/en/core-components/sdk/)**

The basic flow is that you [install](#getting-started) the server and console and wrap any 
reads or writes in your app with one of our SDKs. Once that's done, you will be 
able to see the app and the data your app is reading or writing in the 
[console](https://github.com/streamdal/console) (or use the [CLI](https://github.com/streamdal/cli)).

You will also be able to enforce rules on your data (such as _"this should be 
valid JSON"_, _"message should contain a field called `foo`"_, _"strip all email
addresses"_ and so on).

> [!IMPORTANT]
> For a more in-depth explanation of the flow and the various components, visit 
> our [docs](https://docs.streamdal.com/en/getting-started/how-streamdal-works/).

# Repo Layout

This repo is a [monorepo](https://en.wikipedia.org/wiki/Monorepo) that has the following layout and usage:

```plaintext
# ┌── assets                 <--- Static assets 
# │   ├── img
# │   └── ...
# ├── apps
# │   ├── cli                <--- CLI UI 
# │   ├── console            <--- Web-based UI
# │   ├── docs               <--- https://docs.streamdal.com 
# │   ├── server             <--- Server component
# │   └── ...
# ├── docs
# │   ├── install
# │	│    ├── bare-metal
# │	│    ├── docker
# │	│    └── ...
# |   ├── instrument
# |   └── ...
# ├── libs
# │   ├── protos             <--- Common protobuf schemas
# │   ├── wasm               <--- Wasm funcs used in pipeline steps
# │   ├── wasm-detective     <--- Wasm lib used for data parsing and validation 
# │   ├── wasm-transformer   <--- Wasm lib used for data transformation
# │   └── ...
# ├── scripts                   
# │   ├── install
# │   │	  └── install.sh     <--- Install script for installing Streamdal
# │   └── ...
# ├── LICENSE
# ├── Makefile               <--- Makefile with common tasks; run `make help` for more info
# └── README.md
```

# Community

We're building Streamdal in the open and we'd love for you to join us!

Join our [Discord](https://discord.gg/streamdal)!

# Resources

### Getting Help

Stuck? Something not working right? Have questions?

* First and _easiest_ way to get help is to join our [Discord](https://discord.gg/streamdal)
* If you're not in the mood to chat - there's [docs](https://docs.streamdal.com)
* If all else fails, [open an issue](https://github.com/streamdal/streamdal/issues/new)!

### Manifesto

To get a better understanding of what we're trying to do, our ethos, principles,
and really, our state of mind - check out our [manifesto](https://streamdal.com/manifesto).

### Roadmap

You have control over what we're building - [our roadmap is 100% public](https://github.com/orgs/streamdal/projects/1)!

Feel free to stop by to discuss features, suggest new ones or just keep an eye
on what's in the pipeline.

### Contributing

We :heart: contributions! But... before you craft a beautiful PR, please read
through our [contributing docs](https://docs.streamdal.com/en/resources-support/contributing/).

### License

This project is licensed under the `Apache-2.0` license. 

See the [LICENSE](LICENSE) file for more info.
