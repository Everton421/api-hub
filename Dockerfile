FROM node:23

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

RUN npm install

COPY . .

RUN npm cache clean --force


EXPOSE 3000

CMD ["node", "--experimental-strip-types","src/server.ts" ]
