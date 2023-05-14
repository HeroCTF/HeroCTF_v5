#! /bin/bash
sudo -u dave /opt/youtrack/bin/youtrack.sh start&
mkdir /var/run/sshd
/usr/sbin/sshd -D