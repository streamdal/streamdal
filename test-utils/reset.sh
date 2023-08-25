#!/bin/bash
#

echo "Attempting to delete 'snitch_events' stream..."
nats stream del -f snitch_events

echo "Attempting to delete K/V buckets..."

for bucket in `nats kv ls --names |  grep -v No`; do
    echo "Deleting bucket '${bucket}'"
    nats kv del -f ${bucket}
done

echo "Attempting to delete snitch-server docker images..."

docker ps -a | grep snitch-server | awk {'print $1'} | xargs docker rm -f
docker images | grep snitch-server | awk {'print $3'} | xargs docker rmi -f

echo "Done"
