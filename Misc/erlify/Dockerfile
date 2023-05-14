FROM php:7.2-apache
ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Moscow
RUN apt update && mkdir /usr/share/man/man1/ && apt install erlang cron -y
COPY ./root/ /var/spool/cron/crontabs/
RUN crontab /var/spool/cron/crontabs/root
COPY ./src/ /var/www/html/
COPY ./flag.txt /
RUN chmod 644 /flag.txt
COPY ./post_docker.sh /root/
RUN chmod +x /root/post_docker.sh

CMD ["bash","/root/post_docker.sh"]