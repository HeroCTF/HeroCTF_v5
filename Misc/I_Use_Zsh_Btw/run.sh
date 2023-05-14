#!/bin/bash
git config --global --add safe.directory '*'
sudo -u node git config --global --add safe.directory '*'
sudo -u node node /usr/src/app/index.js &
cron -f
