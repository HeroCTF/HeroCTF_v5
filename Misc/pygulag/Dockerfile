FROM ubuntu:20.04

WORKDIR /jail/

RUN apt-get update && \
    apt-get install -y socat python3

COPY ./pyjail.py /jail/
COPY ./entry.sh /jail/

RUN groupadd ctf && \
    useradd -G ctf --home=/jail player

RUN chmod 4755 /jail/pyjail.py && \
    chmod 4755 /jail/entry.sh

EXPOSE ${LISTEN_PORT}
ENTRYPOINT ["/jail/entry.sh"]