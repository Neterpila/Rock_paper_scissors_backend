FROM node:15

WORKDIR /docker_app

COPY ./package*.json ./

RUN npm install

COPY . .

ENV PORT=3011

EXPOSE 3011

CMD ["npm", "start"]