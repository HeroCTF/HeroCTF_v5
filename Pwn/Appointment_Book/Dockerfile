FROM ubuntu:22.04

WORKDIR /appointment_book/

RUN apt-get update 
RUN apt-get install -y socat
RUN groupadd ctf

COPY ./appointment_book /appointment_book/
COPY ./entry.sh /appointment_book/
COPY ./flag.txt /appointment_book/

RUN useradd -G ctf --home=/appointment_book player

RUN chmod 755 /appointment_book/appointment_book
RUN chmod 755 /appointment_book/entry.sh
RUN chmod 755 /appointment_book/flag.txt

EXPOSE ${LISTEN_PORT}

ENTRYPOINT ["/appointment_book/entry.sh"]
