FROM node:8

EXPOSE 3000

RUN mkdir -p /opt/app
WORKDIR /opt/app

# check every 30s to ensure this service returns HTTP 200
#HEALTHCHECK CMD curl -fs http://localhost:$PORT/healthz || exit 1

# install dependencies
COPY package.json package.json
RUN npm install && npm cache clean --force

# copy source code
COPY . ./

# run as non-priviledged user
USER node:node

# run command
CMD [ "node", "index.js" ]
