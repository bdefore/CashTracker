class MVC

  conf = require './conf'
  connect = require 'connect'
  express = require 'express'

  # Bootstrap controllers

  @bootControllers: (app) ->
    fs = require 'fs'
    fs.readdir __dirname + '/controllers', (err, files) ->
      if err
        throw err
      files.forEach (file) ->
        bootController app, file

  # Example (simplistic) controller support

  bootController = (app, file) ->
    name = file.replace '.js', ''
    actions = require './controllers/' + name
    plural = name + 's' # realistically we would use an inflection lib
    prefix = '/' + plural

    # Special when for "app"
    if name == 'app'
      prefix = '/'
    
    # TO FIX: Shouldn't need to hijack the nature of objects here
    # just to redirect user to their own account (there will never
    # be access to more than one at a time.
    if name == 'account'
      plural = name
      prefix = "/account"

    Object.keys(actions).map (action) ->
      fn = controllerAction name, plural, action, actions[action]
      switch action
        when 'index' then app.get prefix, fn
        when 'add' then app.get prefix + '/add', fn
        when 'show' then app.get prefix + '/:id.:format?', fn
        when 'create' then app.post prefix + '/:id', fn
        when 'edit' then app.get prefix + '/:id/edit', fn
        when 'update' then app.put prefix + '/:id', fn
        when 'destroy' then app.del prefix + '/:id', fn

  # Proxy res.render() to add some magic

  controllerAction = (name, plural, action, fn) ->
    return (req, res, next) ->
      render = res.render
      format = req.params.format
      path = __dirname + '/views/' + conf.template_engine + '/' + name + '/' +
        action + '.' + conf.template_engine

      res.render = (obj, options, fn) ->
        res.render = render

        # Template path
        if typeof obj == 'string'
          return res.render obj, options, fn

        # Format support
        if action == 'show' && format
          if format == 'json'
            return res.send obj
          else
            throw new Error 'unsupported format "' + format + '"'

        # Render template
        res.render = render
        options = options || {}

        # Expose obj as the "bills" or "bill" local
        if action == 'index'
          options[plural] = obj
        else
          options[name] = obj

        return res.render path, options, fn

      fn.apply this, arguments

class Auth

  fs = require 'fs'
  conf = require './conf'
  express = require 'express'
  mongoose = require 'mongoose'

  mongoose.connect conf.database

  UserSchema = new mongoose.Schema {
    name        : String
    fbId        : Number
  }
  mongoose.model 'User', UserSchema
  User = mongoose.model 'User'

  usersByFbId = {}
  usersById = {}
  nextUserId = 0

  addUser = (source, sourceUser) ->

    if arguments.length == 1
      user = sourceUser = source
      user.id = ++nextUserId
      return usersById[nextUserId] = user
    else
      user = usersById[++nextUserId] = { id: nextUserId }
      user[source] = sourceUser

    console.log '-> addUser: adding user of id: ' + user.id
    return user

  getStoredUser = (id, callback) ->
    User.findOne { fbId: id }, (error, result) ->
      if error
        console.log "Error getting user: " + error

      if !callback
        console.log "Warning: user requested without callback"

      else callback result

  @bootEveryAuth: (app) ->

    everyauth = require 'everyauth'

    # everyauth requires this override in order to store
    # local version of facebook user data
    everyauth.everymodule.findUserById (userId, callback) ->
      User.findOne userId, callback
      # callback null, { userId: userId }

    # Create callback that will store user to db
    facebookResponseCallback = (session, token, extra, fbUserMetadata) ->

      console.log "Checking to see if we have FB user: " + fbUserMetadata.id
      console.log fbUserMetadata

      getStoredUser fbUserMetadata.id, (result) ->
        if !result
          console.log "Is new user record"
          u = new User
            name:   fbUserMetadata.name
            fbId:   fbUserMetadata.id
          u.save()
        else
          console.log "Stored user record found"

      # Check if this user has already been added to our list of users
      # If not, add. Then return this user
      userByFbId = usersByFbId[fbUserMetadata.id]
      if !userByFbId
        userByFbId = usersByFbId[fbUserMetadata.id] = \
          addUser 'facebook', fbUserMetadata

      return userByFbId

    # TO FIX: Find more elegant way of complying with line length
    # than making daisychain variables and \ char. #toolazytoreaddocs
    daisyChain = everyauth \
      .facebook \
      .appId(conf.fb.appId) \
      .appSecret(conf.fb.appSecret) \
      .findOrCreateUser facebookResponseCallback

    # TO FIX: If this could be appeneded to previous call, daisyChain
    # variable is unnecessary
    daisyChain.redirectPath conf.domain + "/account"

    # Link everyauth to express, in order to access user object in view
    # templates
    app.use everyauth.middleware()
    everyauth.helpExpress app

class DB

  mongoose = require 'mongoose'
  conf = require './conf'

  # Mongodb schema

  Schema = mongoose.Schema

  BillSchema = new Schema {
    serial        : String,
    denomination  : Number,
    currency      : String
  }

  SightingSchema = new Schema {
    serial        : String,
    latitude      : Number,
    longitude     : Number,
    comment       : String,
    submitterId   : String
  }

  mongoose.model 'Bill', BillSchema
  Bill = mongoose.model 'Bill'

  mongoose.model 'Sighting', SightingSchema
  Sighting = mongoose.model 'Sighting'

  @connect: () ->
    mongoose.connect conf.database
    console.log "MongoDB connection success..."

  @prepopulate: () ->

    console.log "Checking for existing data..."

    Sighting.findOne null, (error, result) ->
      if result
        console.log "Found a sighting... skipping dummy data creation..."
      else
        console.log "No sightings found, filling with dummy data..."

        b = new Bill
          serial: 'X18084287225'
          denomination: 20
          currency: 'Euro'
        b.save()

        b = new Bill
          serial: 'Y81450250492'
          denomination: 10
          currency: 'Euro'
        b.save()

        s = new Sighting
          serial: 'X18084287225'
          latitude: "41.377301033335414"
          longitude: "2.189307280815329"
          comment: 'I got this from my mother'
        s.save()

        s = new Sighting
          serial: 'Y81450250492'
          latitude: "31.377301033335414"
          longitude: "-32.189307280815329"
          comment: 'I got this from a restaurant'
        s.save()

        s = new Sighting
          serial: 'Y81450250492'
          latitude: "61.377301033335414"
          longitude: "-12.189307280815329"
          comment: 'I got this from my sister'
        s.save()

        s = new Sighting
          serial: 'Y81450250492'
          latitude: "11.377301033335414"
          longitude: "-22.189307280815329"
          comment: 'I got this from Bob'
        s.save()

        console.log "Dummy data created..."

# require('zappa') ->

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