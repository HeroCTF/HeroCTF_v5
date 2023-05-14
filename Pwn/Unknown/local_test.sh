#!/bin/bash

./make.sh

docker rm -f $(docker ps -aq)
docker build --tag 'unknown' .
docker run -p 6667:6667 --detach 'unknown'

nc 127.0.0.1 6667
