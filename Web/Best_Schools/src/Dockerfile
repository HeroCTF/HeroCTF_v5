FROM node:latest

WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 3000

USER 1000

CMD ["node","server.js"]