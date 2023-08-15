# syntax=docker/dockerfile:1
#https://stackoverflow.com/questions/69360628/specifying-node-js-version-for-google-cloud-app-engine-flexible
#https://cloud.google.com/appengine/docs/flexible/custom-runtimes/build

FROM node:16.17.1

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD [ "node", "server.js" ]