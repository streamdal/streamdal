# Benchmark Results

```

running 67 tests
test keywords::test_scanner::bench_check_against_10000_pii_strings ... bench:       8,578 ns/iter (+/- 316)
test keywords::test_scanner::bench_check_against_1000_pii_strings  ... bench:       7,980 ns/iter (+/- 96)
test keywords::test_scanner::bench_check_against_100_pii_strings   ... bench:       7,944 ns/iter (+/- 93)
test keywords::test_scanner::bench_check_against_10_pii_strings    ... bench:       7,891 ns/iter (+/- 113)
test keywords::test_scanner::bench_standard_pii_large_accuracy     ... bench:   2,584,912 ns/iter (+/- 42,189)
test keywords::test_scanner::bench_standard_pii_large_performance  ... bench:   1,436,091 ns/iter (+/- 16,650)
test keywords::test_scanner::bench_standard_pii_medium_accuracy    ... bench:     336,891 ns/iter (+/- 3,559)
test keywords::test_scanner::bench_standard_pii_medium_performance ... bench:     209,452 ns/iter (+/- 1,911)
test keywords::test_scanner::bench_standard_pii_small_accuracy     ... bench:      81,867 ns/iter (+/- 419)
test keywords::test_scanner::bench_standard_pii_small_performance  ... bench:      72,443 ns/iter (+/- 1,096)
test test_bench::bench_credit_card                                 ... bench:         831 ns/iter (+/- 98)
test test_bench::bench_credit_card_payload                         ... bench:      35,562 ns/iter (+/- 3,107)
test test_bench::bench_email                                       ... bench:         615 ns/iter (+/- 20)
test test_bench::bench_email_payload                               ... bench:      29,317 ns/iter (+/- 899)
test test_bench::bench_email_utf8                                  ... bench:       1,050 ns/iter (+/- 35)
test test_bench::bench_has_field                                   ... bench:         528 ns/iter (+/- 24)
test test_bench::bench_hostname                                    ... bench:         476 ns/iter (+/- 12)
test test_bench::bench_ipv4_address                                ... bench:         282 ns/iter (+/- 39)
test test_bench::bench_ipv6_address                                ... bench:         397 ns/iter (+/- 15)
test test_bench::bench_mac_address                                 ... bench:         430 ns/iter (+/- 19)
test test_bench::bench_semver                                      ... bench:         451 ns/iter (+/- 19)
test test_bench::bench_string_contains_all                         ... bench:         295 ns/iter (+/- 9)
test test_bench::bench_string_contains_any                         ... bench:         294 ns/iter (+/- 9)
test test_bench::bench_uuid                                        ... bench:         503 ns/iter (+/- 19)


```
