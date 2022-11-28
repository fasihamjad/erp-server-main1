FROM node:16

RUN apk add --update bash

# Setting working directory. 
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json ./
RUN npm install

# Copying source files
COPY . .

# Build files
RUN npm run build

EXPOSE 8000
CMD [ "node", "index.js" ]