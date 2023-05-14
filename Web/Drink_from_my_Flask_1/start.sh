#! /bin/bash
cron -f&
cd /var/www/app
sudo -u www-data /usr/bin/python3 app.py --port 80
