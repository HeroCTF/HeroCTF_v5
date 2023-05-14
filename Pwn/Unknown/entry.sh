#!/bin/bash

while :
do
	su player -c "exec socat TCP-LISTEN:${LISTEN_PORT},reuseaddr,fork EXEC:'/unknown/unknown,stderr'";
done
