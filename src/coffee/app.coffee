# require('zappa') ->

DB = require './db'
MVC = require './mvc'
Auth = require '.auth'

DB.connect()
DB.prepopulate()

# @use 'bodyParser', 'cookieParser', 'methodOverride', app.router, \
  # static: __dirname + '/public'

# @use 'bodyParser', 'cookieParser', 'methodOverride', session: \
  # { secret: 'bunniesonfire' }, app router, static: __dirname + '/public'

# @configure
#   development: => @use errorHandler: {dumpExceptions: on}
#   production: => @use 'errorHandler'

# BEWARE: Sequence matters.
# Note: express.session call MUST precede auth init
# Note: Auth.bootEveryAuth MUST precede app.router call, or else 
# req.user is not assigned
express = require 'express'
app = express.createServer()
app.use express.logger ':method :url :status'
app.use express.errorHandler { dumpExceptions: true, showStack: true }
app.use express.bodyParser()
app.use express.methodOverride()
app.use express.cookieParser()
app.use express.favicon()
app.use express.session { secret: 'bunniesonfire' }
Auth.bootEveryAuth app
app.use app.router
app.use express.static __dirname + '/public'

conf = require './conf'

# @set 'views': __dirname + '/views/' + conf.template_engine
# @set 'view engine': conf.template_engine
# # get '/': -> render 'index.jade'
# @get '/': "hi!"

# blacklist = 'scope self locals filename debug compiler compileDebug \
  # inline'.split ' '
# @register jade: @zappa.adapter 'jade', blacklist

app.set 'views', __dirname + '/views/' + conf.template_engine
app.set 'view engine', conf.template_engine

# @register coffee: require('coffeekup').adapters.express

# Example 500 page
app.error = (err, req, res) -> render '500'

# TO FIX: 404 not hooked up right since coffeescript migration. Confusion
# between use and app.use

# Example 404 page via simple Connect middleware
# use(function(req, res){
#   res.render('404')
# })

hasMessages = (req) ->
  if !req.session
    return false
  huh = Object.keys req.session.flash || {}
  return huh.length

request = (req) ->
  return req

messages = (req) ->
  return ->
    msgs = req.flash()
    temp1 = Object.keys msgs
    return temp1.reduce ((arr, type) ->
      return arr.concat msgs[type]
    ), []

app.dynamicHelpers { hasMessages, request, messages }

MVC.bootControllers app

app.listen 3000