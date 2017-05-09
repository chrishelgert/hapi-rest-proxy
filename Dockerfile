FROM node:alpine

# Create app directory
RUN mkdir -p /code/hapi-rest-proxy
WORKDIR /code/hapi-rest-proxy

# Set environment variable
ENV NODE_ENV production

# Install app dependencies
COPY package.json yarn.lock /code/hapi-rest-proxy/
RUN yarn --pure-lockfile && yarn cache clean

# Bundle app source
COPY . /code/hapi-rest-proxy

# Port
EXPOSE 8080

# Start
CMD [ "yarn", "start" ]
