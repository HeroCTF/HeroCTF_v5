FROM ubuntu:22.04

WORKDIR /unknown/

RUN apt-get update 
RUN apt-get install -y socat
RUN groupadd ctf

COPY ./unknown /unknown/
COPY ./entry.sh /unknown/
COPY ./flag.txt /unknown/

RUN useradd -G ctf --home=/unknown player

RUN chmod 755 /unknown/unknown
RUN chmod 755 /unknown/entry.sh
RUN chmod 755 /unknown/flag.txt

EXPOSE ${LISTEN_PORT}

ENTRYPOINT ["/unknown/entry.sh"]
