Streamdal
=========
[![GitHub](https://img.shields.io/github/license/streamdal/streamdal)](https://github.com/streamdal/streamdal)
[![Discord](https://img.shields.io/discord/123456789?color=blue&label=discord)](https://discord.gg/123456789)

This is the _main_ repo for the [Streamdal](https://streamdal.com) project.

Streamdal is a combination of open source services and SDKs that enable _real-time_:

* Data observability (think `tail -f` for your data!)
* Data governance & enforcement
* Data quality monitoring
* Data transformation + obfuscation + masking + stripping

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

# Demo

You don't have to install the [server](https://github.com/streamdal/server), 
the [console](https://github.com/streamdal/console)
or [instrument](https://docs.streamdal.com/instrument) any of your apps to see 
Streamdal in action. We've got a live demo :)

**[DEMO.STREAMDAL.COM](https://demo.streamdal.com)**

In the live demo, you can:

1. Select any component and start a `Tail` to see the data it is consuming or
producing in _real-time_
2. Create pipelines that detect, transform, obfuscate, mask, strip or validate data
3. Attach and detach pipelines to components
4. Watch read/write throughput of components

**Each one of these actions is occurring in _real-time_!**

You can read more about how this is achieved [here](https://docs.streamdal.com/arch).

# Getting Started

Getting started consists of two steps:

1. **Installing** the server, console and their dependencies
2. **Instrumenting** your code with one of our [SDKs](https://docs.streamdal.com/sdks)

### [STEP 1] Install

The _easiest_ way to get Streamdal running is via `curl | bash`:

```
curl -s https://sh.streamdal.com | bash
```

🎉 **Open `http://localhost:8080` in your browser and you should see the console!** 🎉

> [!NOTE]
> For alternative installation methods, check the [install](./install) dir.

### [STEP 2] Instrument

Once you've installed the server and console, you can instrument your code using
one of our [SDKs](#sdks).

**Go**
```go
// When consuming/reading
// <TODO>

// When producing/writing
// <TODO>
```

**Python**
```python
# When consuming/reading
# <TODO>

# When producing/writing
# <TODO>
```

**Node**
```typescript
// When consuming/reading
// <TODO>

// When producing/writing
// <TODO>
```

> [!IMPORTANT]
> These are _basic_, non-production ready examples.
> 
> For best results, you should read the [docs](https://docs.streamdal.com/sdks) 
> for the SDK you are using.

### SDKs

Several SDKs are available for instrumenting your code:

* [Go](https://github.com/streamdal/go-sdk)
* [Python](https://github.com/streamdal/python-sdk)
* [Node.js](https://github.com/streamdal/node-sdk)

For details on how to use them, refer to the [SDK docs](https://docs.streamdal.com/sdks).

# How Does It Work?

Streamdal consists of **three** main components:

- **[Server](https://github.com/streamdal/server)**
- **[Console](https://github.com/streamdal/console)**
- **[SDKs](https://docs.streamdal.com/sdks)**

The basic flow is that you [install](#getting-started) the server and console and
wrap any reads or writes in your app with our SDK. Once that's done, you will be 
able to see the data your app is reading or writing in the 
[console](https://github.com/streamdal/console) (or use the  
[CLI](https://github.com/streamdal/cli)).

You will also be able to enforce rules on your data (such as _"this should be 
valid JSON"_, _"message should contain a field called `foo`"_, _"strip all email
addresses"_ and so on).

> [!IMPORTANT]
> For a more in-depth explanation of the architecture, the flow and the various
> components, visit our [docs](https://docs.streamdal.com/arch).

# Community

We're building Streamdal in the open and we'd love for you to join us!

Join our [Discord](https://discord.gg/123456789)!

# Resources

### Getting Help

Stuck? Something not working right? Have questions?

* First and _easiest_ way to get help is to join our [Discord](https://discord.gg/123456789)
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
through our [contributing guidelines](https://docs.streamdal.com/contributing).

### License

This project is licensed under the `Apache-2.0` license. 

See the [LICENSE](LICENSE) file for more info.
