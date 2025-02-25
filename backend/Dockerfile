FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install --save-dev nodemon

COPY . .

EXPOSE 5000

CMD ["npx", "nodemon", "server.js"]
