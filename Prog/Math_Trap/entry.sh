#! /bin/bash

while :
do
    su -c "exec socat TCP-LISTEN:${LISTEN_PORT},reuseaddr,fork EXEC:'/mathtrap/chall.py,stderr'" - player;
done