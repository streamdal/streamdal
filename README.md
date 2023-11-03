<div align="center" id="to-top">
   
<img src="./src/images/readme/streamdal-logo-dark.png#gh-dark-mode-only"><img src="./src/images/readme/streamdal-logo-light.png#gh-light-mode-only">  

[![GitHub](https://img.shields.io/github/license/streamdal/streamdal)](https://github.com/streamdal/streamdal)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

</div>  

**This is the documentation repo for the [Streamdal](https://streamdal.com) project.**

https://docs.streamdal.com

Streamdal is a combination of open-source services and SDKs that enable 
real-time:

- Data observability _(think_ `tail -f`_, but for your app’s runtime data)_
- Data quality monitoring
- (Beta) Ultra-low overhead pipelines using [WASM](https://webassembly.org/)
- (Beta) Data transformation + obfuscation + masking + stripping


To get a better understanding of what we're trying to do, our ethos, 
principles, and really, our state of mind - check out our 
[manifesto](https://streamdal.com/manifesto).

---

<div align="center">

[Overview](#overview) •
[Developer Docs](#developer-docs) •
[Resources](#resources) •
[Contributing](#contributing) •
[Community](#community)
</div>

If you experience any issues with the documentation, whether it be poor 
readability/experience, missing/incorrect info, typos, or anything, please feel 
free to [reach out](#community) or simply open an 
<a href="https://github.com/streamdal/docs/issues">issue</a>.


## Overview

The Streamdal documentation is broken up into two categories: `Developer Docs` 
and `Resources`.

### Developer Docs

All of the necessary information for getting started and using Streamdal can 
be found under `Developer Docs`. 

Below are some sections picked from the _Developer Docs_ that should be the most 
helpful for getting started with Streamdal:

#### Streamdal Core

- [What is Streamdal?](https://docs.streamdal.com/en/what-is-streamdal/)
- [How Streamdal Works](https://docs.streamdal.com/en/getting-started/how-streamdal-works/)
- [Quickstart](https://docs.streamdal.com/en/getting-started/quickstart/)
- [Core Components Overview](https://docs.streamdal.com/en/core-components/overview/)

#### Guides
- [Instrumentation](https://docs.streamdal.com/en/guides/instrumentation/)
- [Deployment](https://docs.streamdal.com/en/guides/deployment/)
- [Tail](https://docs.streamdal.com/en/guides/tail/)

### Resources

The `Resources` section contains other important (but mostly supplemental) 
information.

Below are some sections picked from _Resources_ that should be pretty handy 
when wanting support, clarity, or mesmerizing software factoids 🧙 :

- [Getting Support](https://docs.streamdal.com/en/resources-support/get-support/)
- [FAQ](https://docs.streamdal.com/en/resources-support/faq/)
- [Open Source](https://docs.streamdal.com/en/resources-support/open-source/)
- [Changelog](https://docs.streamdal.com/en/resources-support/changelog/)



<div align="right">
[<a href="#to-top">Back to top</a>]
</div>

## Contributing

Streamdal is an open-source project using the 
[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.) 
Feel free to add feature proposals or contributions! But first:

- Read the [Contributing page](https://docs.streamdal.com/en/resources-support/contributing/)
- Be sure to check out the [code of conduct](https://docs.streamdal.com/en/resources-support/contributing/#code-of-conduct) before opening up a new issue or PR
- Take a look at the [roadmap](https://github.com/orgs/streamdal/projects/1) to gauge our current projects. 

### Adding to Docs

We are committed to having informative, useful, easy-to-read, and beautiful 
documentation. We are using [Astro](https://docs.astro.build) for our docs.


To contribute to this repo:

1. **Clone the repo and make your relevant changes in a new branch.**

    You'll probably want to run the Astro dev server to make sure your changes don't look whackadoo or aren't causing build issues. Here is a quick command cheat sheet for getting that up and running:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

2. **Submit a PR.**
    
That's it!

We may modify your additions/subtractions over time for clarity and readability. Feel free to make design requests for anything you submit (or feel is needed), and we are happy to make it happen!

<div align="right">
[<a href="#to-top">Back to top</a>]
</div>

## Community

<img src="./src/images/readme/community.png" />

We're building Streamdal in the open and we'd would love to have you join! 

Let's build together 💪

<div align="right">
[<a href="#to-top">Back to top</a>]
</div>
