FROM debian:latest

# setup user
RUN adduser --disabled-password --gecos "" user \
        && echo 'user:password123' | chpasswd

# sshd setup
RUN mkdir /var/run/sshd \
	&& apt update -y \
	&& apt install -y openssh-server \
	&& apt clean \
	&& service ssh start

# setup chall
RUN echo "Hero{chmod_1337_would_have_been_easier}" > /flag.txt \
	&& chown user:user /flag.txt \
	&& /bin/chmod 0 /flag.txt \
	&& /bin/chmod 0 /bin/chmod

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]
