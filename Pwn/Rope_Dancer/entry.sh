#!/bin/bash

while :
do
	su player -c "exec socat TCP-LISTEN:${LISTEN_PORT},reuseaddr,fork EXEC:'/ropedancer/ropedancer,stderr'";
done
