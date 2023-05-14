FROM ubuntu:latest
RUN apt update && apt install gcc openssh-server -y
WORKDIR /root
COPY ./src/ .
COPY ./hide_access_log.log /var/log/
COPY ./sshd_config /etc/ssh/
RUN ./install.sh && \
    echo "root:root" | chpasswd

CMD ["bash","/root/post_docker_creation.sh"]