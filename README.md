# [WIP] hapi-rest-proxy

[![Build Status](https://travis-ci.org/chrishelgert/hapi-rest-proxy.svg?branch=master)](https://travis-ci.org/chrishelgert/hapi-rest-proxy)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Greenkeeper badge](https://badges.greenkeeper.io/chrishelgert/hapi-rest-proxy.svg)](https://greenkeeper.io/)

> hapi-rest-proxy: a proxy server for making REST calls to server without cors headers

## Getting started

### Node

1. Grap the latest [release](https://github.com/chrishelgert/hapi-rest-proxy/releases)
2. set your port via process.env.PORT (default: 8080)
3. Start the proxy with `yarn start` or `npm start`
4. Make your REST calls over http://localhost:8080?url=YOUR_URL

### Docker

1. Grap the latest [release](https://github.com/chrishelgert/hapi-rest-proxy/releases)
2. Build the image with
  * `npm run docker:build`
  * `yarn docker:build`
  * or `docker build -t hapi-rest-proxy .`
3. Start the container with
  * `npm run docker:start`
  * `yarn docker:start`
  * `docker run -d -p 8080:8080 hapi-rst-proxy`
4. Make your REST calls over http://localhost:8080?url=YOUR_URL

## Example

```
curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://localhost:8080?url=http://api.fixer.io/latest
```

## Contributing

1. Fork it
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create new Pull Request

## LICENSE

Copyright (c) 2017 Chris Helgert. See [License](./LICENSE) for details.
