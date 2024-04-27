#!/usr/bin/env bash

docker ps | grep logstash | awk {'print $1'} | xargs docker rm -f
docker-compose up -d logstash

container_id=$(docker ps | grep logstash | awk {'print $1'})

echo ">> New container id: ${container_id}"

 # Run commands in the container as root
docker exec -it -u root ${container_id} bash -c "apt-get update"
docker exec -it -u root ${container_id} bash -c "apt-get -y install netcat"

echo ">> Run the following commands in 3 terminals:"
echo ""
echo "docker logs -f ${container_id}"
echo ""
echo "docker exec -u 0 ${container_id} bash -c 'nc -l 6000'"
echo ""
echo ">> This one requires you to first exec into the container and then do 'nc localhost 6001':"
echo "docker exec -u 0 -it ${container_id} /bin/bash"

