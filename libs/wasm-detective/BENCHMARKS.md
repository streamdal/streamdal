# Benchmark Results

```

running 74 tests
test keywords::test_scanner::bench_check_against_10000_pii_strings ... bench:   8,494,787 ns/iter (+/- 147,431)
test keywords::test_scanner::bench_check_against_1000_pii_strings  ... bench:     827,906 ns/iter (+/- 10,587)
test keywords::test_scanner::bench_check_against_100_pii_strings   ... bench:      81,574 ns/iter (+/- 757)
test keywords::test_scanner::bench_check_against_10_pii_strings    ... bench:      16,253 ns/iter (+/- 334)
test keywords::test_scanner::bench_standard_pii_large_accuracy     ... bench:  56,982,079 ns/iter (+/- 4,477,300)
test keywords::test_scanner::bench_standard_pii_large_performance  ... bench:   1,387,170 ns/iter (+/- 17,315)
test keywords::test_scanner::bench_standard_pii_medium_accuracy    ... bench:   5,802,129 ns/iter (+/- 371,682)
test keywords::test_scanner::bench_standard_pii_medium_performance ... bench:     225,933 ns/iter (+/- 1,152)
test keywords::test_scanner::bench_standard_pii_small_accuracy     ... bench:     199,121 ns/iter (+/- 3,312)
test keywords::test_scanner::bench_standard_pii_small_performance  ... bench:      98,830 ns/iter (+/- 2,111)
test matcher_pii_tests::bench_plaintext                            ... bench:      31,493 ns/iter (+/- 2,457)
test test_bench::bench_credit_card                                 ... bench:         829 ns/iter (+/- 32)
test test_bench::bench_credit_card_payload                         ... bench:      36,825 ns/iter (+/- 200)
test test_bench::bench_email                                       ... bench:         616 ns/iter (+/- 5)
test test_bench::bench_email_payload                               ... bench:      30,340 ns/iter (+/- 280)
test test_bench::bench_email_utf8                                  ... bench:       1,051 ns/iter (+/- 9)
test test_bench::bench_has_field                                   ... bench:         538 ns/iter (+/- 6)
test test_bench::bench_hostname                                    ... bench:         484 ns/iter (+/- 4)
test test_bench::bench_ipv4_address                                ... bench:         285 ns/iter (+/- 2)
test test_bench::bench_ipv6_address                                ... bench:         398 ns/iter (+/- 6)
test test_bench::bench_mac_address                                 ... bench:         425 ns/iter (+/- 5)
test test_bench::bench_semver                                      ... bench:         456 ns/iter (+/- 6)
test test_bench::bench_string_contains_all                         ... bench:         292 ns/iter (+/- 13)
test test_bench::bench_string_contains_any                         ... bench:         290 ns/iter (+/- 3)
test test_bench::bench_uuid                                        ... bench:         505 ns/iter (+/- 3)


```
