# [WIP] hapi-rest-proxy

[![Build Status](https://travis-ci.org/chrishelgert/hapi-rest-proxy.svg?branch=master)](https://travis-ci.org/chrishelgert/hapi-rest-proxy)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Greenkeeper badge](https://badges.greenkeeper.io/chrishelgert/hapi-rest-proxy.svg)](https://greenkeeper.io/)

> hapi-rest-proxy: a proxy server for making REST calls to server without cors headers

## Getting started

* grap the latest release
* define your port via process.env.PORT (default 8080)
* yarn/npm start
* make your REST call to the proxy server with your URL as GET param

## Call me
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
