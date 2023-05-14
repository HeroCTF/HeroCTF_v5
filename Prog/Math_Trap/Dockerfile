FROM ubuntu:20.04

WORKDIR /mathtrap/

RUN apt-get update && \
    apt-get install -y socat python3

COPY ./chall.py /mathtrap/
COPY ./entry.sh /mathtrap/
COPY ./flag.txt /mathtrap/

RUN groupadd ctf && \
    useradd -G ctf --home=/mathtrap player && \
    chown player:player /mathtrap/chall.py

RUN chmod 4755 /mathtrap/chall.py && \
    chmod 4755 /mathtrap/entry.sh

ENV TERM xterm

EXPOSE ${LISTEN_PORT}
ENTRYPOINT ["/mathtrap/entry.sh"]