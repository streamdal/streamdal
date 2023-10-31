<div align="center">
   
<img src="./assets/streamdal-logo-dark.png#gh-dark-mode-only"><img src="./assets/streamdal-logo-light.png#gh-light-mode-only">  

[![GitHub](https://img.shields.io/github/license/streamdal/streamdal)](https://github.com/streamdal/streamdal)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

</div>  

**This is the _main_ repo for the [Streamdal](https://streamdal.com) project.**

Streamdal is a combination of open source services and SDKs that enable _real-time_:

* _Data observability (think `tail -f` for your data!)_
* _Data governance & enforcement_
* _Data quality monitoring_
* _Data transformation + obfuscation + masking + stripping_

.. and [a bunch of other things](https://docs.streamdal.com/capabilities).

<sub>_This is what it looks like:_</sub>
<img src="assets/img.png">

<div align="center">

[Overview](#streamdal) •
[Demo](#demo) •
[Getting Started](#getting-started) •
[How Does It Work?](#how-does-it-work) •
[Community](#community) •
[Resources](#resources)

</div>

# Live Demo

You don't have to install the [server](https://github.com/streamdal/server), 
the [console](https://github.com/streamdal/console)
or [instrument](https://docs.streamdal.com/instrument) any of your apps to see 
Streamdal in action. We've got a live demo :)

### [DEMO.STREAMDAL.COM](https://demo.streamdal.com)

_The demo will showcase:_

1. **Tail**
    * Select any Component and start `Tail` request to watch live output
2. **Welcome Service/Emailer**
    * View how attached `Mask dot com emails` pipeline obfuscates `recipient` field if field contains `.com`
3. **Signup Service/Recorder**
    * Observe attached `Scrub ICMP` pipeline changing `object.ipv4_address` if `object.protocol` equals "ICMP"
4. **Observe Throughput**
    * Watch the read/write-per-second throughput for any component
5. **Data Graph**
    * Use the service map to see all services, operations and components and how they relate to each other
    * The [data graph](https://docs.streamdal.com/en/resources-support/glossary/#data-graph) is the "node map" of all services and components
6. **Schema Inference**
    * View the inferred JSON Schema for all consumers and producers 

**Each one of these actions is occurring in _real-time_!**

<sub>_You can read more about how this is achieved in the ["how does it work?"](https://docs.streamdal.com/en/getting-started/how-streamdal-works/) docs._</sub>

# Getting Started

Getting started consists of two steps:

1. **Installing** the server, console and their dependencies
2. **Instrumenting** your code with one of our [SDKs](https://docs.streamdal.com/sdks)

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

<sub>_For alternative installation methods, check the [install](./install) dir._</sub>

### Instrument

Once you've installed the server and console, you can instrument your code using
one of our [SDKs](#sdks).

> To see an example of a _complete_ instrumentation, take a look at the
[Go demo client](https://github.com/streamdal/server/tree/main/test-utils/demo-client) 
> that is bundled with the [server](https://github.com/streamdal/server).

**[Go](https://github.com/streamdal/go-sdk)**
```go
// TODO - show minimal code example _without_ checking resp
```

**[Python](https://github.com/streamdal/python-sdk)**
```python
# TODO - show minimal code example _without_ checking resp
```

**[Node.js](https://github.com/streamdal/node-sdk)**
```typescript
import { OperationType, Streamdal } from "@streamdal/node-sdk/streamdal";

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
> Refer to the [instrumentation docs]([https://docs.streamdal.com/en/core-components/sdk/](https://docs.streamdal.com/en/guides/instrumentation/)) for more thorough directions.

# How Does It Work?

Streamdal consists of **three** main components:

- **[Server](https://github.com/streamdal/server)**
- **[Console](https://github.com/streamdal/console)**
- **[SDKs](https://docs.streamdal.com/en/core-components/sdk/)**

The basic flow is that you [install](#getting-started) the server and console and
wrap any reads or writes in your app with our SDK. Once that's done, you will be 
able to see the data your app is reading or writing in the 
[console](https://github.com/streamdal/console) (or use the  
[CLI](https://github.com/streamdal/cli)).

You will also be able to enforce rules on your data (such as _"this should be 
valid JSON"_, _"message should contain a field called `foo`"_, _"strip all email
addresses"_ and so on).

> [!IMPORTANT]
> For a more in-depth explanation of the flow and the various components, visit 
> our [docs](https://docs.streamdal.com/en/getting-started/how-streamdal-works/).

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

We :heart: contributions! But... before you craft an amazing PR, please read
through our [contributing docs](https://docs.streamdal.com/en/resources-support/contributing/).

### License

This project is licensed under the `Apache-2.0` license. 

See the [LICENSE](LICENSE) file for more info.
