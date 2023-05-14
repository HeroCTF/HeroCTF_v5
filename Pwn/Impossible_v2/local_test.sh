#!/bin/bash

gcc -no-pie -Wno-format-security -o impossible_v2 impossible_v2.c aes.c

docker rm -f $(docker ps -aq)
docker build --tag 'impossible_v2' .
docker run -p 6667:6667 --detach 'impossible_v2'

nc 127.0.0.1 6667
