const Hapi = require('hapi')
const Boom = require('boom')
const rp = require('request-promise-native')
const tt = require('tinytime')
const path = require('path')

const server = new Hapi.Server({
  port: process.env.PORT || '8080',
  routes: { cors: true }
})

const template = tt('{YYYY}-{Mo}-{DD} {H}:{mm}:{ss}')

const overrideHeaders = {
  accept: 'application/json',
  'accept-encoding': undefined,
  host: undefined,
  referer: undefined
}

function log (method, statusCode, url) {
  // eslint-disable-next-line no-console
  console.log(`${template.render(new Date())} | ${method} | ${statusCode} | ${url}`)
}

const getUrlFromQuery = (query) => {
  const url = decodeURI(query.url)

  if (Object.keys(query).length <= 1) {
    return url
  }

  // if it is a url with searchParams, they get splitted so combine them again
  const searchParams = Object.entries(query)
    .filter(keyValue => keyValue[0] !== 'url')
    .map(keyValue => keyValue.join('='))
    .join('&')

  return `${url}&${searchParams}`
}

(async function hapiRestProxy () {
  await server.register({ plugin: require('inert') })

  server.route({
    method: '*',
    path: '/',
    handler: async (request, h) => {
      const method = request.method.toUpperCase()

      if (method === 'GET' && request.query.url === undefined) {
        return h.file(path.join(__dirname, 'static', 'index.html'))
      }

      if (!request.query.url) {
        log(method, 400, undefined)
        return Boom.badRequest('missing param url')
      }

      const uri = getUrlFromQuery(request.query)

      try {
        const result = await rp({
          // hapi gives the request method in lowerCase
          method,
          uri,
          body: request.payload || undefined,
          headers: Object.assign({}, request.headers, overrideHeaders),
          json: true
        })

        log(method, 200, uri)

        return result
      } catch (err) {
        if (err.statusCode) {
          log(method, err.statusCode, uri)

          return new Boom(err.statusMessage, { statusCode: err.statusCode, data: uri })
        } else {
          log(method, 500, uri)

          return Boom.badImplementation()
        }
      }
    }
  })

  try {
    await server.start()
    console.info('Server running at:', server.info.uri)
  } catch (err) {
    console.error('There was an error starting the server', err)
  }
}())
