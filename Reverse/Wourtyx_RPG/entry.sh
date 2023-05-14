#!/bin/bash

while :
do
	su player -c "exec socat TCP-LISTEN:${LISTEN_PORT},reuseaddr,fork EXEC:'/RPG/out,stderr'";
done
