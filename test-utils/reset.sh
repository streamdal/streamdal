#!/bin/bash
#

echo "Attempting to delete 'snitch_events' stream..."
nats stream del -f snitch_events

echo "Attempting to delete K/V buckets..."

for bucket in `nats kv ls --names |  grep -v No`; do
    echo "Deleting bucket '${bucket}'"
    nats kv del -f ${bucket}
done
