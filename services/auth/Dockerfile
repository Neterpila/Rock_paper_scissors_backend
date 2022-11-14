FROM node:12

WORKDIR /docker_app

COPY ./package*.json ./

RUN npm install

COPY . .

ENV PORT=3002

EXPOSE 3002

CMD ["npm", "start"]