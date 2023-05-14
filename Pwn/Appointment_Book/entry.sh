#!/bin/bash

while :
do
	su player -c "exec socat TCP-LISTEN:${LISTEN_PORT},reuseaddr,fork EXEC:'/appointment_book/appointment_book,stderr'";
done
