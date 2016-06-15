'use strict';

const path = require('path')
const koa = require('koa')
const send = require('koa-send')
const cofs = require('co-fs')
const route = require('koa-route')
const mount = require('koa-mount')
const auth = require('koa-basic-auth')
const serve = require('koa-static')
const logger = require('koa-log-requests')

const options = function *(){ this.body = "Allow: HEAD,GET,PUT,DELETE,OPTIONS" }
const home = function *(next){
  if(this.req.url.indexOf('admin') !== -1)
    this.body = yield cofs.readFile(
      path.resolve(__dirname, 'public/admin.html')
    , 'utf8'
    )
  else
    this.body = yield cofs.readFile(
      path.resolve(__dirname, 'public/index.html')
    , 'utf8'
    )
}

const app = koa()
app.use(logger())
app.use(function *(next){
  try{ yield next }
  catch (err) {
    if (401 == err.status) {
      this.status = 401
      this.set('WWW-Authenticate', 'Basic')
      this.body = 'cant haz that'
    }
    else
      throw err
  }
})
app.use(serve(path.resolve(__dirname, './public')))
app.use(route.get('/options', options))

app.use(mount('/admin', auth({ name: 'extia', pass: 'extia-makers' })))
app.use(home)

app.listen(process.env.PORT || 8080)
console.log('Server listen on port 8080')
