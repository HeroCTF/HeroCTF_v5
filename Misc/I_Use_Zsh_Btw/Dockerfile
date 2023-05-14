FROM node:latest
RUN apt update && \
    apt install zsh cron netcat expect sudo -y
COPY ./flag.txt /
COPY node /var/spool/cron/crontabs/
RUN crontab /var/spool/cron/crontabs/node

WORKDIR /usr/src/app
COPY run.sh /home/node/
RUN chmod 777 /home/node/run.sh
RUN chown -R node:node /usr/src/app
USER node
COPY look_at_user.sh /home/node/
COPY package*.json ./
USER root
RUN chmod 777 /home/node/look_at_user.sh && \
    echo "y" | sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" && \
    npm i && \
    cp /root/.zshrc /home/node/ && \
    chown node:node /home/node/.zshrc && \
    cp -r /root/.oh-my-zsh/ /home/node/ && \
    chown -R node:node /home/node/.oh-my-zsh/ && \
    chsh -s /bin/zsh node
USER node
RUN mkdir data
COPY index.js .
EXPOSE 3000
USER root
CMD ["bash","/home/node/run.sh"]