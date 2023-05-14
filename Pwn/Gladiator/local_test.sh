#!/bin/bash

cc -no-pie -Wl,-z,norelro -o gladiator gladiator.c -lpthread

docker rm -f $(docker ps -aq)
docker build --tag 'gladiator' .
docker run -p 6667:6667 --detach 'gladiator'

nc 127.0.0.1 6667
