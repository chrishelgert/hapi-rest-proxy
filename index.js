const Hapi = require('hapi')
const Boom = require('boom')
const rp = require('request-promise-native')
const tt = require('tinytime')

const server = new Hapi.Server()
const template = tt('{YYYY}-{Mo}-{DD} {H}:{mm}:{ss}')

function log (method, statusCode, url) {
  // eslint-disable-next-line no-console
  console.log(`${template.render(new Date())} | ${method} | ${statusCode} | ${url}`)
}

server.connection({
  port: process.env.PORT || '8080',
  routes: { cors: true }
})

server.route({
  method: '*',
  path: '/',
  handler: async (request, reply) => {
    const method = request.method.toUpperCase();

    try {
      const result = await rp({
        // hapi gives the request method in lowerCase
        method,
        uri: request.query.url,
        body: request.payload || undefined,
        json: true
      })

      log(method, 200, request.query.url)

      reply(result)
    } catch (err) {
      if (err.statusCode) {
        log(method, err.statusCode, request.query.url)

        return reply(Boom.create(err.statusCode, err.statusMessage, request.query.url))
      } else {
        log(method, 500, request.query.url)

        reply(Boom.badImplementation)
      }
    }
  }
})

server.start()
  .then(() => {
    console.info('Server running at:', server.info.uri)
  })
  .catch(() => {
    console.error('There was an error starting the server')
    return server.stop()
  })
