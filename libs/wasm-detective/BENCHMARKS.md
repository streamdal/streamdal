# Benchmark Results

```

running 80 tests
test keywords::test_scanner::bench_check_against_10000_pii_strings ... bench:   8,449,375 ns/iter (+/- 21,582)
test keywords::test_scanner::bench_check_against_1000_pii_strings  ... bench:     812,866 ns/iter (+/- 4,924)
test keywords::test_scanner::bench_check_against_100_pii_strings   ... bench:      79,639 ns/iter (+/- 606)
test keywords::test_scanner::bench_check_against_10_pii_strings    ... bench:      15,886 ns/iter (+/- 110)
test keywords::test_scanner::bench_standard_pii_large_accuracy     ... bench:  53,925,300 ns/iter (+/- 589,707)
test keywords::test_scanner::bench_standard_pii_large_performance  ... bench:   1,399,625 ns/iter (+/- 9,206)
test keywords::test_scanner::bench_standard_pii_medium_accuracy    ... bench:   5,596,320 ns/iter (+/- 56,250)
test keywords::test_scanner::bench_standard_pii_medium_performance ... bench:     226,307 ns/iter (+/- 3,326)
test keywords::test_scanner::bench_standard_pii_small_accuracy     ... bench:     194,133 ns/iter (+/- 6,595)
test keywords::test_scanner::bench_standard_pii_small_performance  ... bench:      97,864 ns/iter (+/- 1,016)
test test_bench::bench_credit_card                                 ... bench:         859 ns/iter (+/- 12)
test test_bench::bench_credit_card_payload                         ... bench:      35,150 ns/iter (+/- 567)
test test_bench::bench_email                                       ... bench:         640 ns/iter (+/- 14)
test test_bench::bench_email_payload                               ... bench:      31,664 ns/iter (+/- 283)
test test_bench::bench_email_utf8                                  ... bench:       1,095 ns/iter (+/- 10)
test test_bench::bench_get_json_payloads                           ... bench:      18,377 ns/iter (+/- 291)
test test_bench::bench_has_field                                   ... bench:         563 ns/iter (+/- 15)
test test_bench::bench_hostname                                    ... bench:         490 ns/iter (+/- 13)
test test_bench::bench_ipv4_address                                ... bench:         293 ns/iter (+/- 5)
test test_bench::bench_ipv6_address                                ... bench:         418 ns/iter (+/- 11)
test test_bench::bench_mac_address                                 ... bench:         446 ns/iter (+/- 8)
test test_bench::bench_plaintext                                   ... bench:      63,946 ns/iter (+/- 1,257)
test test_bench::bench_plaintext_with_embedded                     ... bench:   1,373,637 ns/iter (+/- 28,262)
test test_bench::bench_plaintext_without_embedded                  ... bench:   1,180,102 ns/iter (+/- 11,820)
test test_bench::bench_semver                                      ... bench:         468 ns/iter (+/- 7)
test test_bench::bench_string_contains_all                         ... bench:         312 ns/iter (+/- 7)
test test_bench::bench_string_contains_any                         ... bench:         311 ns/iter (+/- 8)
test test_bench::bench_uuid                                        ... bench:         523 ns/iter (+/- 8)


```
