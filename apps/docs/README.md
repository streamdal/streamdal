<div align="center" id="to-top">
   
<img src="./src/images/readme/streamdal-logo-dark.png#gh-dark-mode-only"><img src="./src/images/readme/streamdal-logo-light.png#gh-light-mode-only">  

[![Release](https://github.com/streamdal/streamdal/actions/workflows/apps-docs-release.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/apps-docs-release.yml)
[![Pull Request](https://github.com/streamdal/streamdal/actions/workflows/apps-docs-pr.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/apps-docs-pr.yml)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

</div>

_**An Astro app used for documentation found at https://docs.streamdal.com**._

<sub>For more details, see the main
[streamdal repo](https://github.com/streamdal/streamdal).</sub>

---

<div align="center">

[Overview](#overview) • •
[Contributing](#contributing) •
[Community](#community)
</div>

If you experience any issues with the documentation, whether it be poor 
readability/experience, missing/incorrect info, typos, or anything, please feel 
free to [reach out](#community) or open an 
<a href="https://github.com/streamdal/streamdal/issues">issue</a>.


## Overview

The Streamdal documentation is broken up into two categories: `Developer Docs` 
and `Resources`.

* _Developer Docs_ contains all of the necessary information for getting started
and using Streamdal.
* _Resources_ contains supplemental information such as support, contributing, and 
    open source information.
    
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

We may modify your additions/subtractions over time for clarity and readability. Feel free to make design requests for anything you submit and we'll be happy to make it happen!

<div align="right">
[<a href="#to-top">Back to top</a>]
</div>

## Release

Any push or merge to main with changes on `/apps/docs` will automatically tag
and release a new console version with `apps/docs/vX.Y.Z`.

<sub>If you'd like to skip running the release action on push/merge to `main`, 
include "norelease" anywhere in the commit message.</sub>

## Community

<img src="./src/images/readme/community.png" />

We're building Streamdal in the open and we'd would love to have you join! 

Let's build together 💪

https://discord.gg/streamdal

<div align="right">
[<a href="#to-top">Back to top</a>]
</div>
