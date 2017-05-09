FROM mhart/alpine-node

# Install Yarn
RUN apk add --no-cache --virtual .build-deps tar curl bash gnupg \
  && curl -o- -L https://yarnpkg.com/install.sh | bash \
  && apk del .build-deps
ENV PATH /root/.yarn/bin:$PATH

# Create app directory
RUN mkdir -p /code/hapi-rest-proxy
WORKDIR /code/hapi-rest-proxy

# Install app dependencies
COPY package.json /code/hapi-rest-proxy/
RUN apk add --no-cache --virtual .app-deps python make g++ \
  && yarn --pure-lockfile \
  && yarn cache clean \
  && apk del .app-deps

# Bundle app source
COPY . /code/hapi-rest-proxy

# Port
EXPOSE 8080

# Start
CMD [ "yarn", "start" ]