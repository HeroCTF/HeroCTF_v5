#!/bin/bash

gcc -no-pie -Wl,-z,norelro -o appointment_book appointment_book.c

docker rm -f $(docker ps -aq)
docker build --tag 'ropedancer' .
docker run -p 6667:6667 --detach 'ropedancer'

nc 127.0.0.1 6667
