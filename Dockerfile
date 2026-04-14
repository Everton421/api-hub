FROM node:23

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN npm cache clean --force

RUN npm install

EXPOSE 3000

CMD ["node", "--env-file=.env", "--experimental-strip-types","src/server.ts" ]
