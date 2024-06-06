# Benchmark Results

```

running 80 tests
test keywords::test_scanner::bench_check_against_10000_pii_strings ... bench:   8,480,666 ns/iter (+/- 32,816)
test keywords::test_scanner::bench_check_against_1000_pii_strings  ... bench:     822,208 ns/iter (+/- 10,263)
test keywords::test_scanner::bench_check_against_100_pii_strings   ... bench:      79,061 ns/iter (+/- 4,800)
test keywords::test_scanner::bench_check_against_10_pii_strings    ... bench:      16,097 ns/iter (+/- 100)
test keywords::test_scanner::bench_standard_pii_large_accuracy     ... bench:  56,983,395 ns/iter (+/- 1,538,594)
test keywords::test_scanner::bench_standard_pii_large_performance  ... bench:   1,394,000 ns/iter (+/- 27,504)
test keywords::test_scanner::bench_standard_pii_medium_accuracy    ... bench:   5,864,608 ns/iter (+/- 351,391)
test keywords::test_scanner::bench_standard_pii_medium_performance ... bench:     226,247 ns/iter (+/- 2,196)
test keywords::test_scanner::bench_standard_pii_small_accuracy     ... bench:     200,116 ns/iter (+/- 2,715)
test keywords::test_scanner::bench_standard_pii_small_performance  ... bench:      98,979 ns/iter (+/- 711)
test test_bench::bench_credit_card                                 ... bench:         870 ns/iter (+/- 12)
test test_bench::bench_credit_card_payload                         ... bench:      34,587 ns/iter (+/- 501)
test test_bench::bench_email                                       ... bench:         648 ns/iter (+/- 6)
test test_bench::bench_email_payload                               ... bench:      31,183 ns/iter (+/- 232)
test test_bench::bench_email_utf8                                  ... bench:       1,082 ns/iter (+/- 14)
test test_bench::bench_get_json_payloads                           ... bench:      18,053 ns/iter (+/- 433)
test test_bench::bench_has_field                                   ... bench:         603 ns/iter (+/- 12)
test test_bench::bench_hostname                                    ... bench:         516 ns/iter (+/- 6)
test test_bench::bench_ipv4_address                                ... bench:         314 ns/iter (+/- 10)
test test_bench::bench_ipv6_address                                ... bench:         431 ns/iter (+/- 5)
test test_bench::bench_mac_address                                 ... bench:         461 ns/iter (+/- 7)
test test_bench::bench_plaintext                                   ... bench:      39,015 ns/iter (+/- 659)
test test_bench::bench_plaintext_with_embedded                     ... bench:     701,131 ns/iter (+/- 3,093)
test test_bench::bench_plaintext_without_embedded                  ... bench:     523,847 ns/iter (+/- 4,741)
test test_bench::bench_semver                                      ... bench:         484 ns/iter (+/- 3)
test test_bench::bench_string_contains_all                         ... bench:         326 ns/iter (+/- 4)
test test_bench::bench_string_contains_any                         ... bench:         329 ns/iter (+/- 7)
test test_bench::bench_uuid                                        ... bench:         534 ns/iter (+/- 3)


```
