// Pretty(ish) print configuration output on application startup! Make it easy
// to see what those env vars actually told your app to do!
//
// The most basic usage is:
//
//  rubberneck.Print(myConfigStruct)
//
// Which will print out an output something like:
//
//   Settings -----------------------------------------
//     * AdvertiseIP: 192.168.168.168
//     * ClusterIPs: [10.3.18.204 123.123.123.123]
//     * ConfigFile: sidecar.toml
//     * ClusterName: default
//     * CpuProfile: false
//     * Discover: [docker static]
//     * HAproxyDisable: false
//     * LoggingLevel:
//     * Sidecar:
//       * ExcludeIPs: [192.168.168.168]
//       * StatsAddr:
//       * PushPullInterval:
//         * Duration: 20s
//       * GossipMessages: 20
//       * LoggingFormat: standard
//       * LoggingLevel: debug
//       * DefaultCheckEndpoint:
//     * DockerDiscovery:
//   	* DockerURL: unix:///var/run/docker.sock
//   --------------------------------------------------
//
// You may configure a Printer for your specific needs if the default usage
// is not suited to your purposes.
package rubberneck
