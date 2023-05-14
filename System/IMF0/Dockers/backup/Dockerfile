FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive

# Install dependecies
RUN apt update -y && apt install zip sudo vim iputils-ping nginx php8.1-fpm rsyslog openssh-server rsync -y

# Setup users
RUN adduser --disabled-password --gecos "" dave
RUN echo 'dave:dbfcbbab4b415bccf570' | chpasswd
RUN ln -s /dev/null /home/dave/.bash_history
COPY --chown=dave:dave ssh /home/dave/.ssh
RUN chmod 600 /home/dave/.ssh/id_rsa
RUN usermod -a -G backup dave

RUN echo "www-data ALL=(backup) NOPASSWD: /usr/bin/rsync" >> /etc/sudoers

# Setup php log checker
COPY default /etc/nginx/sites-available/default
COPY --chown=www-data:www-data log_checker.php /var/www/html/index.php
COPY log.txt /var/log/backup.log
RUN chmod o+w /var/log/backup.log

# Setup backup
RUN mkdir /backup && chown backup:backup /backup && chmod 770 /backup
COPY --chown=backup:backup backup.sh /backup/backup.sh
RUN chmod +x /backup/backup.sh
USER dave
RUN echo "* * * * * /backup/backup.sh 2> /dev/null" | crontab -
USER root
COPY --chown=dave:dave youtrack-1683836642.zip /backup/youtrack-1683836642.zip

# Write flags
RUN echo "Hero{n0t_0nly_hum4ns_c4n_b3_po1s3n3d}" > /backup/flag.txt && chown backup:backup /backup/flag.txt && chmod 700 /backup/flag.txt

# Copy starup file to container and run it
COPY start.sh /root/start.sh
RUN chmod +x /root/start.sh
EXPOSE 22
CMD ["/root/start.sh"]