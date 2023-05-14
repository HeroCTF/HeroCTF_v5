FROM ubuntu:22.04

WORKDIR /ropedancer/

RUN apt-get update 
RUN apt-get install -y socat
RUN groupadd ctf

COPY ./ropedancer /ropedancer/
COPY ./entry.sh /ropedancer/
COPY ./selection_criterias.txt /ropedancer/

RUN useradd -G ctf --home=/ropedancer player

RUN chmod 755 /ropedancer/ropedancer
RUN chmod 755 /ropedancer/entry.sh
RUN chmod 755 /ropedancer/selection_criterias.txt

EXPOSE ${LISTEN_PORT}

ENTRYPOINT ["/ropedancer/entry.sh"]
