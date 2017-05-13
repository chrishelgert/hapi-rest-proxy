jest.mock('request-promise-native')

const tt = require('tinytime')
const template = tt('{YYYY}-{Mo}-{DD} {H}:{mm}:{ss}')

const headers = {
  accept: 'application/json',
  'accept-encoding': 'gzip',
  authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3NzY1MjYyMmZjOGQyMTEwMDRiN2EzNCIsInNjb3BlIjoiYWRtaW4iLCJ1c2VybmFtZSI6Imdyb290IiwiaWF0IjoxNDk0MzUxMzIxLCJleHAiOjE0OTQ0Mzc3MjF9.vkBkTP3i0MceYjjPQUUZyNTyrpCuax2ZlHC_wGeq5aQ',
  'content-type': 'application/json',
  host: 'localhost:8080',
  referer: 'http://localhost:8080/',
  'user-agent': 'curl/7.51.0'
}

const expectedHeaders = {
  accept: 'application/json',
  'accept-encoding': undefined,
  authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3NzY1MjYyMmZjOGQyMTEwMDRiN2EzNCIsInNjb3BlIjoiYWRtaW4iLCJ1c2VybmFtZSI6Imdyb290IiwiaWF0IjoxNDk0MzUxMzIxLCJleHAiOjE0OTQ0Mzc3MjF9.vkBkTP3i0MceYjjPQUUZyNTyrpCuax2ZlHC_wGeq5aQ',
  'content-type': 'application/json',
  host: undefined,
  referer: undefined,
  'user-agent': 'curl/7.51.0'
}

describe('hapi-rest-proxy', () => {
  const testDate = new Date(1494178965528)
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
      register: jest.fn(),
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

        test('replies the information page, if called without url', () => (
          handler(
            {
              method: 'get',
              query: {},
              payload: undefined,
              headers
            },
            {
              file: (template) => {
                expect(template.indexOf('static/index.html') !== 1).toBeTruthy()
              }
            }
          )
            .then(() => {
              expect(rp).not.toHaveBeenCalled()
            })
        ))

        describe('makes an request with method and payload to the server', () => {
          test('handles url params', () => (
            handler(
              {
                method: 'get',
                query: { url: 'https://www.i-want-to-test.com/api?json=true', limit: 1000 },
                payload: undefined,
                headers
              },
              () => {}
            )
              .then(() => {
                expect(rp).toHaveBeenCalledWith({
                  method: 'GET',
                  uri: 'https://www.i-want-to-test.com/api?json=true&limit=1000',
                  json: true,
                  headers: expectedHeaders
                })
              })
          ))

          test('GET', () => (
            handler(
              {
                method: 'get',
                query: { url: 'https://www.i-want-to-test.com/api' },
                payload: undefined,
                headers
              },
              () => {}
            )
              .then(() => {
                expect(rp).toHaveBeenCalledWith({
                  method: 'GET',
                  uri: 'https://www.i-want-to-test.com/api',
                  json: true,
                  headers: expectedHeaders
                })
              })
          ))

          test('POST', () => (
            handler(
              {
                method: 'post',
                query: { url: 'https://www.i-want-to-test.com/api' },
                payload: { name: 'hapi-rest-proxy' },
                headers
              },
              () => {}
            )
              .then(() => {
                expect(rp).toHaveBeenCalledWith({
                  method: 'POST',
                  uri: 'https://www.i-want-to-test.com/api',
                  body: { name: 'hapi-rest-proxy' },
                  json: true,
                  headers: expectedHeaders
                })
              })
          ))

          test('PUT', () => (
            handler(
              {
                method: 'put',
                query: { url: 'https://www.i-want-to-test.com/api/1' },
                payload: { name: 'hapi-rest-proxy' },
                headers
              },
              () => {}
            )
              .then(() => {
                expect(rp).toHaveBeenCalledWith({
                  method: 'PUT',
                  uri: 'https://www.i-want-to-test.com/api/1',
                  body: { name: 'hapi-rest-proxy' },
                  json: true,
                  headers: expectedHeaders
                })
              })
          ))

          test('DELETE', () => (
            handler(
              {
                method: 'delete',
                query: { url: 'https://www.i-want-to-test.com/api/1' },
                payload: undefined,
                headers
              },
              () => {}
            )
              .then(() => {
                expect(rp).toHaveBeenCalledWith({
                  method: 'DELETE',
                  uri: 'https://www.i-want-to-test.com/api/1',
                  json: true,
                  headers: expectedHeaders
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
              expect(console.log).toHaveBeenCalledWith(`${template.render(new Date())} | GET | 200 | https://www.i-want-to-test.com/api`)
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
              expect(console.log).toHaveBeenCalledWith(`${template.render(new Date())} | GET | 404 | https://www.i-want-to-test.com/api`)
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
              expect(console.log).toHaveBeenCalledWith(`${template.render(new Date())} | GET | 500 | https://www.i-want-to-test.com/api`)
            })
        })

        test('returns statusCode 400 if the url param is empty', () => {
          setup()

          return server.route.mock.calls[0][0].handler(
            {
              method: 'get',
              query: { url: '' },
              payload: undefined
            },
            (result) => {
              expect(result).toBe(400)
            }
          )
            .then(() => {
              expect(true).toBeFalsy()
            })
            .catch(() => {
              expect(console.log).toHaveBeenCalledWith(`${template.render(new Date())} | GET | 400 | undefined`)
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
