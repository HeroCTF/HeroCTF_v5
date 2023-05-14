FROM ubuntu:22.04

ENV DEBIAN_FRONTEND noninteractive

# Install dependecies
RUN apt update && apt install openssh-server sudo socket netcat -y

# Setup users
RUN adduser --disabled-password --gecos "" user
RUN echo 'user:password123' | chpasswd
RUN ln -sf /dev/null /home/user/.bash_history

# Setup users
RUN adduser --disabled-password --gecos "" privilegeduser
RUN echo 'privilegeduser:5a123c1f9caea986ade2' | chpasswd
RUN ln -sf /dev/null /home/privilegeduser/.bash_history

# Setup Vuln
RUN echo "user ALL=(privilegeduser) NOPASSWD: /usr/bin/socket" >> /etc/sudoers

# Write flag
RUN echo "Hero{ch3ck_f0r_m1sc0nf1gur4t1on5}" > /home/privilegeduser/flag.txt
RUN chown privilegeduser:privilegeduser /home/privilegeduser/flag.txt && chmod 400 /home/privilegeduser/flag.txt

# Copy starup file to container and run it
COPY start.sh /root/start.sh
RUN chmod +x /root/start.sh
EXPOSE 22
CMD ["/root/start.sh"]