#!/bin/bash

gcc -o sELF_control sELF_control.c -luuid

docker rm -f $(docker ps -aq)
docker build --tag 'self_control_v3' .
docker run -p 6667:6667 --detach 'self_control_v3'

nc 127.0.0.1 6667
