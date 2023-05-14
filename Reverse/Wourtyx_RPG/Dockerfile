FROM ubuntu:22.04

WORKDIR /RPG/

RUN apt-get update 
RUN apt-get install -y socat
RUN groupadd ctf

COPY ./out /RPG/
COPY ./FLAG1.txt /RPG/
COPY ./entry.sh /RPG/
COPY ./FLAG2.txt /RPG/

RUN useradd -G ctf --home=/RPG player

RUN chmod 755 /RPG/out
RUN chmod 755 /RPG/FLAG1.txt
RUN chmod 755 /RPG/entry.sh
RUN chmod 755 /RPG/FLAG2.txt

EXPOSE ${LISTEN_PORT}

ENTRYPOINT ["/RPG/entry.sh"]
