jest.mock('request-promise-native')

describe('hapi-rest-proxy', () => {
  const testDate = new Date('2017')
  let server
  let rp

  function setup (startSuccess = true, requestError) {
    const Hapi = require('hapi')

    rp = require('request-promise-native')
    rp.mockImplementation(() => new Promise((resolve, reject) => {
      if (requestError) {
        return reject(requestError)
      }

      return resolve({ test: 'delivers a delicios piece of 🍕' })
    }))

    server = {
      connection: jest.fn(),
      info: { uri: 'http://localhost:8080' },
      route: jest.fn(),
      start: jest.fn(() => new Promise((resolve, reject) => {
        if (startSuccess) {
          return resolve()
        }

        return reject(new Error('test error'))
      })),
      stop: jest.fn()
    }

    Hapi.Server = jest.fn(() => server)
    global.Date = jest.fn(() => testDate)

    /* eslint-disable no-console */
    console.error = jest.fn()
    console.info = jest.fn()
    console.log = jest.fn()
    /* eslint-enable no-console */

    require('../index')
  }

  afterEach(() => {
    delete process.env.PORT
    jest.resetAllMocks()
    jest.resetModules()
  })

  describe('connection', () => {
    test('sets the connection with the default port', () => {
      setup()

      expect(server.connection).toHaveBeenCalledWith({
        port: '8080',
        routes: { 'cors': true }
      })
    })

    test('sets the connection for process.env.PORT', () => {
      process.env.PORT = '9999'
      setup()

      expect(server.connection).toHaveBeenCalledWith({
        port: '9999',
        routes: { 'cors': true }
      })
    })
  })

  describe('route', () => {
    test('listens for requests on "/"', () => {
      setup()

      const call = server.route.mock.calls[0][0]

      expect(call.method).toBe('*')
      expect(call.path).toBe('/')
    })

    describe('handler method', () => {
      let handler

      describe('success handling', () => {
        beforeEach(() => {
          setup()
          handler = server.route.mock.calls[0][0].handler
        })

        describe('makes an request with method and payload to the server', () => {
          test('GET', () => (
            handler(
              {
                method: 'get',
                query: { url: 'https://www.i-want-to-test.com/api' },
                payload: undefined
              },
              () => {}
            )
              .then(() => {
                expect(rp).toHaveBeenCalledWith({
                  method: 'GET',
                  uri: 'https://www.i-want-to-test.com/api',
                  json: true
                })
              })
          ))

          test('POST', () => (
            handler(
              {
                method: 'post',
                query: { url: 'https://www.i-want-to-test.com/api' },
                payload: { name: 'hapi-rest-proxy' }
              },
              () => {}
            )
              .then(() => {
                expect(rp).toHaveBeenCalledWith({
                  method: 'POST',
                  uri: 'https://www.i-want-to-test.com/api',
                  body: { name: 'hapi-rest-proxy' },
                  json: true
                })
              })
          ))

          test('PUT', () => (
            handler(
              {
                method: 'put',
                query: { url: 'https://www.i-want-to-test.com/api/1' },
                payload: { name: 'hapi-rest-proxy' }
              },
              () => {}
            )
              .then(() => {
                expect(rp).toHaveBeenCalledWith({
                  method: 'PUT',
                  uri: 'https://www.i-want-to-test.com/api/1',
                  body: { name: 'hapi-rest-proxy' },
                  json: true
                })
              })
          ))

          test('DELETE', () => (
            handler(
              {
                method: 'delete',
                query: { url: 'https://www.i-want-to-test.com/api/1' },
                payload: undefined
              },
              () => {}
            )
              .then(() => {
                expect(rp).toHaveBeenCalledWith({
                  method: 'DELETE',
                  uri: 'https://www.i-want-to-test.com/api/1',
                  json: true
                })
              })
          ))
        })

        test('logs the success and replies the result', () => (
          handler(
            {
              method: 'get',
              query: { url: 'https://www.i-want-to-test.com/api' },
              payload: undefined
            },
            (result) => {
              expect(result).toEqual({ test: 'delivers a delicios piece of 🍕' })
            }
          )
            .then(() => {
              expect(console.log).toHaveBeenCalledWith('2017-1-1 1:00:00 | GET | 200 | https://www.i-want-to-test.com/api')
            })
        ))
      })

      describe('error handling', () => {
        test('delegates the statuscode', () => {
          setup(true, { statusCode: 404, statusMessage: 'page not found' })

          return server.route.mock.calls[0][0].handler(
            {
              method: 'get',
              query: { url: 'https://www.i-want-to-test.com/api' },
              payload: undefined
            },
            (result) => {
              expect(result).toBe(404)
            }
          )
            .then(() => {
              expect(true).toBeFalsy()
            })
            .catch(() => {
              expect(console.log).toHaveBeenCalledWith('2017-1-1 1:00:00 | GET | 404 | https://www.i-want-to-test.com/api')
            })
        })

        test('returns statusCode 500 if it is not a request error', () => {
          setup(true, new Error('test'))

          return server.route.mock.calls[0][0].handler(
            {
              method: 'get',
              query: { url: 'https://www.i-want-to-test.com/api' },
              payload: undefined
            },
            (result) => {
              expect(result).toBe(500)
            }
          )
            .then(() => {
              expect(true).toBeFalsy()
            })
            .catch(() => {
              expect(console.log).toHaveBeenCalledWith('2017-1-1 1:00:00 | GET | 500 | https://www.i-want-to-test.com/api')
            })
        })
      })
    })
  })

  describe('start', () => {
    test('calls console.info with the server url', () => {
      setup()

      return server.start()
        .then(() => {
          expect(console.info).toHaveBeenCalledWith('Server running at:', 'http://localhost:8080')
        })
    })

    test('calls consle.error if a wild error occurs', () => {
      setup(false)

      return server.start()
        .then(() => {
          expect(true).toBeFalsy()
        })
        .catch(() => {
          expect(console.error).toHaveBeenCalledWith('There was an error starting the server')
        })
    })
  })
})
