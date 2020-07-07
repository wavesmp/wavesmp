const Koa = require('koa')
const bodyParser = require('koa-bodyparser')

const log = require('waves-server-logger')

const METHOD = 'POST'
const PATH = '/csp'

class HttpServer {
  constructor(port) {
    this.port = port
    this.app = new Koa()
    this.app.use(bodyParser({ enableTypes: ['json'] }))
    this.app.use(this.onRequest.bind(this))
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, err =>
        err ? reject(err) : resolve()
      )
    })
  }

  onRequest(ctx) {
    const { method, path } = ctx
    log.warn(`Received REQ with method=${method} path=${path}`)
    ctx.assert(method === METHOD, 405, 'method not allowed')
    ctx.assert(path === PATH, 400, 'bad request')
    ctx.status = 200
    log.warn('Received CSP Violation')
    log.warn(JSON.stringify(ctx.request.body, null, 4))
  }

  close() {
    return new Promise((resolve, reject) => {
      this.server.close(err => (err ? reject(err) : resolve()))
    })
  }
}

module.exports = HttpServer
