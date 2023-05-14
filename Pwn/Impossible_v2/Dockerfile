FROM ubuntu:22.04

WORKDIR /impossible_v2/

RUN apt-get update 
RUN apt-get install -y socat
RUN groupadd ctf

COPY ./impossible_v2 /impossible_v2/
COPY ./entry.sh /impossible_v2/
COPY ./flag.txt /impossible_v2/

RUN useradd -G ctf --home=/impossible_v2 player

RUN chmod 755 /impossible_v2/impossible_v2
RUN chmod 755 /impossible_v2/entry.sh
RUN chmod 755 /impossible_v2/flag.txt

EXPOSE ${LISTEN_PORT}

ENTRYPOINT ["/impossible_v2/entry.sh"]
