#!/bin/bash
XATTR_STR="EVIL_ATTACKER_ATTR"
setfattr -n user.$XATTR_STR -v $XATTR_STR /etc/ld.so.preload
setfattr -n user.$XATTR_STR -v $XATTR_STR /var/log/hide_access_log.log
setfattr -n user.$XATTR_STR -v $XATTR_STR /lib/libselinux.so
rm post_docker_creation.sh
service ssh start
sleep 4000
