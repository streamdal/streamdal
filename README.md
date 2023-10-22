CLI
===
[![Pull Request](https://github.com/streamdal/cli/actions/workflows/pr.yaml/badge.svg)](https://github.com/streamdal/cli/actions/workflows/pr.yaml)
[![Release](https://github.com/streamdal/cli/actions/workflows/release.yaml/badge.svg)](https://github.com/streamdal/cli/actions/workflows/release.yaml)

A CLI viewer app for the [Streamdal](https://streamdal.com) platform.

> It's like a `tail -f`, for your software!

This app looks best if you use it in a _modern_ terminal that has TrueColor 
support such as iTerm2, Alacrity, Konsole, PowerShell and many, many more.

## Demo

## Install
Install via homebrew:
```
brew install streamdal/cli && streamdal --version
```

OR

Install manually:

1. Download latest release [here](https://github.com/streamdal/cli/release)
2. `chmod +x streamdal-*`
3. `mv streamdal ./streamdal --version`

OR

For the brave, install via curl/bash:

`curl -s https://raw.githubusercontent.com/streamdal/cli/main/install.sh | bash`

<sub>This will download the latest release of the CLI and place it in `/usr/local/bin/streamdal`.</sub>

## Usage

Launch the CLI utility by running:

```
$ streamdal --server streamdal-server-address --auth 1234
```

You should see something like this:

## Environment Variables

You can expose several environment variables to the CLI to save on typing:

| Variable                            | Description                                                  | Default       | Required |  
|-------------------------------------|--------------------------------------------------------------|---------------|---------|
| `STREAMDAL_CLI_AUTH`                | Auth token used for communicating with your Streamdal server | None          | **true** |
| `STREAMDAL_CLI_SERVER`              | Server address for your Streamdal server                     | localhost:9090 | **true** |
| `STREAMDAL_CLI_CONNECT_TIMEOUT`     | Enable debug log output                                      | 30s           | false | 
| `STREAMDAL_CLI_DISABLE_TLS`         | Disable TLS when talking to Streamdal server                 | false         | false | 
| `STREAMDAL_CLI_DEBUG`               | Enable debug output (only useful if file logging is enabled) | false         | false |
| `STREAMDAL_CLI_ENABLE_FILE_LOGGING` | Enable logging to a file                                     | false         | false |
| `STREAMDAL_CLI_LOG_FILE`            | Filename for the log (only used if file logging is enabled)  | `filename`    | false |
| `STREAMDAL_CLI_MAX_OUTPUT_LINES`    | Disable TLS when talking to Streamdal server                 | 5_000         | false |

You can expose these variables by using `export` and adding them to your `.rc`
file. Alternatively, you can set them in a `.env` file in whichever directory 
you launch the CLI from.

## Community

Like what you're seeing? Join our [community](https://docs.streamdal.com/community)!
