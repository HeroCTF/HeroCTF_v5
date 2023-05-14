FROM ubuntu:22.04

WORKDIR /gladiator/

RUN apt-get update 
RUN apt-get install -y socat
RUN groupadd ctf

COPY ./gladiator /gladiator/
COPY ./entry.sh /gladiator/
COPY ./flag.txt /gladiator/

RUN useradd -G ctf --home=/gladiator player

RUN chmod 755 /gladiator/gladiator
RUN chmod 755 /gladiator/entry.sh
RUN chmod 755 /gladiator/flag.txt

EXPOSE ${LISTEN_PORT}

ENTRYPOINT ["/gladiator/entry.sh"]
