FROM ubuntu:22.04

WORKDIR /self/

RUN apt-get update 
RUN apt-get install -y socat
RUN groupadd ctf

COPY ./sELF_control /self/
COPY ./get_flag /self/
COPY ./entry.sh /self/
COPY ./flag.txt /self/

RUN useradd -G ctf --home=/self player

RUN chmod 755 /self/sELF_control
RUN chmod 755 /self/get_flag
RUN chmod 755 /self/entry.sh
RUN chmod 755 /self/flag.txt

EXPOSE ${LISTEN_PORT}

ENTRYPOINT ["/self/entry.sh"]
