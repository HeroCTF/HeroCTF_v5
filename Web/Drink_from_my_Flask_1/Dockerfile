FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive

# Install dependecies
RUN apt-get update && apt-get install -y software-properties-common gcc && \
    add-apt-repository -y ppa:deadsnakes/ppa
RUN apt update && \
    apt -y install vim python3.10 python3-pip sudo curl cron

# Setup users
RUN adduser --disabled-password --gecos "" flaskdev
RUN echo 'flaskdev:f7543a013fbbfb1e8e0e9e6ce10faf' | chpasswd
RUN ln -sf /dev/null /home/flaskdev/.bash_history
RUN chmod a+rx /home/flaskdev
USER flaskdev
RUN { crontab -l; echo "* * * * * /home/flaskdev/reboot_flask.sh"; } | crontab -
USER root


# Setup Vulnerable Flask Apps
RUN pip3 install flask==2.2.3 pyjwt
RUN mkdir -p /var/www/app /var/www/dev /var/www/config
RUN ln -s /dev/urandom /var/www/config/urandom
RUN chmod a+rwx /var/www/config
COPY files/app/app.py /var/www/app/app.py
COPY files/app/dev.py /var/www/dev/app.py
COPY files/reboot_flask.sh /home/flaskdev/reboot_flask.sh
RUN chmod +x /home/flaskdev/reboot_flask.sh
COPY files/werkzeug_debug_init.py /usr/local/lib/python3.10/dist-packages/werkzeug/debug/__init__.py

# Setup Vulnerable Flask App

# Write flags
RUN echo "Hero{sst1_fl4v0ur3d_c0Ok1e}" > /var/www/app/flag.txt
RUN chown www-data:www-data /var/www/app/flag.txt && chmod 400 /var/www/app/flag.txt
RUN echo "Hero{n0t_s0_Urandom_4ft3r_4ll}" > /home/flaskdev/flag.txt
RUN chown flaskdev:flaskdev /home/flaskdev/flag.txt && chmod 400 /home/flaskdev/flag.txt

# Copy starup file to container and run it
COPY start.sh /root/start.sh
RUN chmod +x /root/start.sh
EXPOSE 80
CMD ["/root/start.sh"]
