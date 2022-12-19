FROM node:12

WORKDIR /docker_app

COPY ./package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]