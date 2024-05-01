# Benchmark results
```

running 64 tests
test keywords::test_scanner::bench_check_against_10000_pii_strings ... bench:      10,982 ns/iter (+/- 160)
test keywords::test_scanner::bench_check_against_1000_pii_strings  ... bench:       7,903 ns/iter (+/- 86)
test keywords::test_scanner::bench_check_against_100_pii_strings   ... bench:       7,929 ns/iter (+/- 79)
test keywords::test_scanner::bench_check_against_10_pii_strings    ... bench:       7,894 ns/iter (+/- 62)
test keywords::test_scanner::bench_standard_pii_large              ... bench:   2,586,327 ns/iter (+/- 39,647)
test keywords::test_scanner::bench_standard_pii_medium             ... bench:     336,164 ns/iter (+/- 4,606)
test keywords::test_scanner::bench_standard_pii_small              ... bench:      80,982 ns/iter (+/- 579)
test test_bench::bench_credit_card                                 ... bench:         833 ns/iter (+/- 9)
test test_bench::bench_credit_card_payload                         ... bench:      36,759 ns/iter (+/- 190)
test test_bench::bench_email                                       ... bench:         615 ns/iter (+/- 7)
test test_bench::bench_email_payload                               ... bench:      30,102 ns/iter (+/- 319)
test test_bench::bench_email_utf8                                  ... bench:       1,049 ns/iter (+/- 10)
test test_bench::bench_has_field                                   ... bench:         535 ns/iter (+/- 5)
test test_bench::bench_hostname                                    ... bench:         482 ns/iter (+/- 9)
test test_bench::bench_ipv4_address                                ... bench:         283 ns/iter (+/- 3)
test test_bench::bench_ipv6_address                                ... bench:         407 ns/iter (+/- 5)
test test_bench::bench_mac_address                                 ... bench:         425 ns/iter (+/- 9)
test test_bench::bench_semver                                      ... bench:         452 ns/iter (+/- 7)
test test_bench::bench_string_contains_all                         ... bench:         299 ns/iter (+/- 3)
test test_bench::bench_string_contains_any                         ... bench:         296 ns/iter (+/- 13)
test test_bench::bench_uuid                                        ... bench:         509 ns/iter (+/- 6)


```
