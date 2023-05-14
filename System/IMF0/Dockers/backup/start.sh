#! /bin/bash
service nginx start
service php8.1-fpm start
sudo rsyslogd && chmod -R o+r /var/log
cron -f&
mkdir /var/run/sshd
/usr/sbin/sshd -D