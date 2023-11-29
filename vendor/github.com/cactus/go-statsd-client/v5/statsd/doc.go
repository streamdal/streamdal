// Copyright (c) 2012-2016 Eli Janssen
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file.

/*
Package statsd provides a StatsD client implementation that is safe for
concurrent use by multiple goroutines and for efficiency can be created and
reused.

Example usage:

    // First create a client config. Here is a simple config that sends one
    // stat per packet (for compatibility).
    config := &statsd.ClientConfig{
        Address: "127.0.0.1:8125",
        Prefix: "test-client",
    }

    // Now create the client
    client, err := statsd.NewClientWithConfig(config)

    // and handle any initialization errors
    if err != nil {
        log.Fatal(err)
    }

    // make sure to clean up
    defer client.Close()

    // Send a stat
    err = client.Inc("stat1", 42, 1.0)
    // handle any errors
    if err != nil {
        log.Printf("Error sending metric: %+v", err)
    }

*/
package statsd
