[![LICENSE](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
[![Build Status](https://travis-ci.com/InVisionApp/go-logger.svg?token=KosA43m1X3ikri8JEukQ&branch=master)](https://travis-ci.com/InVisionApp/go-logger)
[![codecov](https://codecov.io/gh/InVisionApp/go-logger/branch/master/graph/badge.svg?token=hhqA1l88kx)](https://codecov.io/gh/InVisionApp/go-logger)
[![Go Report Card](https://goreportcard.com/badge/github.com/InVisionApp/go-logger)](https://goreportcard.com/report/github.com/InVisionApp/go-logger)
[![Godocs](https://img.shields.io/badge/golang-documentation-blue.svg)](https://godoc.org/github.com/InVisionApp/go-logger)



<img align="right" src="images/go-logger.svg" width="200">

# go-logger
This package provides a standard interface for logging in any go application.  
Logger interface allows you to maintain a unified interface while using a custom logger. This allows you to write log statements without dictating the specific underlying library used for logging. You can avoid vendoring of logging libraries, which is especially useful when writing shared code such as a library.  
This package also contains a simple logger and a no-op logger which both implement the interface. The simple logger is a wrapper for the standard logging library which meets this logger interface. The no-op logger can be used to easily silence all logging.  
This library is also supplemented with some additional helpers/shims for other common logging libraries such as logrus to allow them to meet the logger interface.

## Usage
The logger interface defines 4 levels of logging: `Debug`, `Info`, `Warn`, and `Error`. These will accept a variadic list of strings as in `fmt.Println`. All the string parameters will be concatenated into a single message.  
Additionally, each of the log levels offers a formatted string as well: `Debugf`, `Infof`, `Warnf`, and `Errorf`. These functions, like `fmt.Printf` and offer the ability to define a format string and parameters to populate it.  
Finally, there is a `WithFields(Fields)` method that will allow you to define a set of fields that will always be logged with evey message. This method returns copy of the logger and appends all fields to any preexisting fields.

## Implementations

### Simple Logger
The simple logger is a wrapper for the standard logging library which meets this logger interface. It provides very basic logging functionality with log levels in messages.

```go
import "github.com/InVisionApp/go-logger"

logger := log.NewSimple()
logger.Debug("this is a debug message")
```
output:
```
2018/03/04 12:55:08 [DEBUG] Simplelogger
```

### No-op Logger
If you do not wish to perform any sort of logging whatsoever, you can point to a noop logger. This is useful for silencing logs in tests, or allowing users to turn of logging in your library.

```go
import "github.com/InVisionApp/go-logger"

logger := log.NewNoop()
logger.Debug("this is a debug message")
```
_no output_

### Logrus Logger
This shim allows you to use logrus as your logger implementation. If you wish to use the standard logrus logger, pass `nil` to the constructor. Otherwise, pass in your own `logrus.Logger`.

```go
import "github.com/InVisionApp/go-logger/shims/logrus"

// Default logrus logger
logger := logrus.New(nil)
logger.Debug("this is a debug message")
```

Or alternatively, you can provide your own logrus logger:
```go
import (
	lgrs "github.com/sirupsen/logrus"
	"github.com/InVisionApp/go-logger/shims/logrus"
)

myLogrus := lgrs.New()
myLogrus.Out = &bytes.Buffer{} 
logger := logrus.New(myLogrus)
logger.Debug("this is a debug message")
```

output:
```
time="2018-03-04T13:12:35-08:00" level=debug msg="this is a debug message"
```

### Zerolog Logger
This shim allows you to use [zerolog](https://github.com/rs/zerolog) as your logging implementation.  If you pass `nil` into `New(...)`, 
you will get a default `zerolog.Logger` writing to `stdout` with a timestamp attached.

Alternatively, you can pass your own instance of `zerolog.Logger` to `New(...)`.

Using the `zerolog` default logger:
```go
import "github.com/InVisionApp/go-logger/shims/zerolog"

func main() {
	logger := zerolog.New(nil)
    logger.Debug("this is a debug message!")
}

```

Using your own logger:
```go
import (
	"os"
	
	zl "github.com/rs/zerolog"
	"github.com/InVisionApp/go-logger/shims/zerolog"
)

func main() {
	// zerolog is a structured logger by default
	structuredLogger := zl.New(os.Stdout).Logger()
	sLogger := zerolog.New(structuredLogger)
	sLogger.Debug("debug message")
	// {"level":"debug", "message":"debug message"}
	
	// If you want to use zerolog for human-readable console logging, 
	// you create a ConsoleWriter and use it as your io.Writer implementation
	consoleLogger := zl.New(zl.ConsoleWriter{
		Out: os.Stdout,
	})
	cLogger := zerolog.New(consoleLogger)
	cLogger.Debug("debug message")
	// |DEBUG| debug message
}
```

### Test Logger
The test logger is for capturing logs during the execution of a test. It writes the logs to a byte buffer which can be dumped and inspected. It also tracks a call count of the total number of times the logger has been called.  
**_Note:_** this logger is not meant to be used in production. It is purely designed for use in tests.

### Fake Logger
A generated fake that meets the logger interface. This is useful if you want to stub out your own functionality for the logger in tests. This logger is meant for use in tests and not in production. If you simply want to silence logs, use the no-op logger.

---

#### \[Credit\]
The go-logger gopher image by [talpert](https://github.com/talpert)  
Original artwork designed by Renée French
