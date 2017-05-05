const Hapi = require('hapi')
const Boom = require('boom')
const rp = require('request-promise-native')
const tt = require('tinytime')

const server = new Hapi.Server()
const template = tt('{YYYY}-{Mo}-{DD} {H}:{mm}:{ss}')

function log (statusCode, url) {
  // eslint-disable-next-line no-console
  console.log(template.render(new Date()), statusCode, url)
}

server.connection({
  port: process.env.PORT || '8080',
  routes: { cors: true }
})

server.route({
  method: '*',
  path: '/',
  handler: async (request, reply) => {
    try {
      const result = await rp({
        // hapi gives the request method in lowerCase
        method: request.method.toUpperCase(),
        uri: request.query.url,
        body: request.payload || undefined,
        json: true
      })

      log(200, request.query.url)

      reply(result)
    } catch (err) {
      if (err.statusCode) {
        log(err.statusCode, request.query.url)

        return reply(Boom.create(err.statusCode, err.statusMessage, request.query.url))
      } else {
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
