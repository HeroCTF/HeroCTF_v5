#! /bin/bash

while :
do
    su -c "exec socat TCP-LISTEN:${LISTEN_PORT},reuseaddr,fork EXEC:'/jail/pyjail.py,stderr'" - player;
done