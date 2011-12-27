w = require 'winston'
fs = require 'fs'

db = require './db'
mvc = require './mvc'
auth = require './auth'

pathToConfig = __dirname + '/../config/' + process.env['NODE_ENV'] + '.json'

w.warn "===================="
w.warn "Starting CashTracker"
w.warn "===================="
w.info "Loading configuration from: " + pathToConfig

fs.readFile pathToConfig, (error, data) ->
  if error
    w.error error
    w.error "Be sure you have specified NODE_ENV!"
  else
    config = JSON.parse data
    w.info "Configuration file loaded: " + config

    if config.logging
      if config.logging.console
        w.remove w.transports.Console
        w.add w.transports.Console, config.logging.console
      if config.logging.logfile
        w.add w.transports.File, config.logging.logfile
      if config.logging.loggly
        w.add w.transports.Loggly, config.logging.loggly

    w.warn "============================================="
    w.warn "Starting CashTracker in NODE_ENV: " + process.env['NODE_ENV']
    w.warn "============================================="

    db.connect config.database
    db.prepopulate()

    baseDir = __dirname + "/.."

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
    auth.bootEveryAuth app, config.creds
    app.use app.router
    app.use express.static baseDir + '/public'

    app.set 'views', baseDir + '/views/' + config.template_engine
    app.set 'view engine', config.template_engine

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

    mvc.bootControllers app, config.template_engine

    app.listen 3000