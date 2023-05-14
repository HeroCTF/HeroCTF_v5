FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive

# Install dependecies
RUN apt update -y && apt install sudo vim curl openssh-server iputils-ping netcat zip -y

# Setup users
RUN adduser --disabled-password --gecos "" dave
RUN echo 'dave:46a35e3948e85dff0d30' | chpasswd
COPY --chown=dave:dave .bash_history /home/dave/.bash_history
COPY --chown=dave:dave randomfile.txt.enc /home/dave/randomfile.txt.enc
COPY --chown=dave:dave authorized_keys /home/dave/.ssh/authorized_keys

RUN adduser --disabled-password --gecos "" bob
RUN echo 'bob:password' | chpasswd
COPY --chown=bob:bob welcome.txt /home/bob/welcome.txt

# Setup Vulnerable yourtrack
RUN wget https://log-s.xyz/e9d406ca7faaf187f1d6eadbeyoutrack-2020.5.2579.zip -P /opt/ &&\
    unzip /opt/e9d406ca7faaf187f1d6eadbeyoutrack-2020.5.2579.zip -d /opt/ &&\
    rm /opt/e9d406ca7faaf187f1d6eadbeyoutrack-2020.5.2579.zip
RUN chown -R dave:dave /opt/youtrack
RUN chmod 700 /opt/youtrack

# Write flags
RUN echo "Hero{pl41nt3xt_p4ssw0rd_4nd_s5t1_b1t_much_41nt_1t?}" > /home/dave/flag.txt && chown dave:dave /home/dave/flag.txt && chmod 700 /home/dave/flag.txt

# Copy starup file to container and run it
COPY start.sh /root/start.sh
RUN chmod +x /root/start.sh
EXPOSE 22
CMD ["/root/start.sh"]
