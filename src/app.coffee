class mvc
  
  conf = require('./conf')
  connect = require('connect')
  express = require('express');

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
    name = file.replace('.js', '')
    actions = require('./controllers/' + name)
    plural = name + 's' # realistically we would use an inflection lib
    prefix = '/' + plural; 

    # Special when for "app"
    if name == 'app'
      prefix = '/'

    Object.keys(actions).map (action) ->
      fn = controllerAction(name, plural, action, actions[action])
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
      path = __dirname + '/views/' + conf.template_engine + '/' + name + '/' + action + '.' + conf.template_engine;
      res.render = (obj, options, fn) ->
        res.render = render
        # Template path
        if typeof obj == 'string'
          return res.render obj, options, fn

        # Format support
        if action == 'show' && format
          if format == 'json'
            return res.send(obj);
          else
            throw new Error('unsupported format "' + format + '"')

        # Render template
        res.render = render
        options = options || {}

        # Expose obj as the "bills" or "bill" local
        if action == 'index'
          options[plural] = obj;
        else
          options[name] = obj;

        user = {}
        
        # if( req.isAuthenticated() ) {
        #   user.username = JSON.stringify( req.getAuthDetails().user );
        # }
        # else user.username = "Not logged in"; 

        # if(req.user) user.username = req.user;
        # else user.username = "fweoeooeoe";

        # options.user = user;

        return res.render path, options, fn

      fn.apply this, arguments

class auth

  fs = require('fs')
  conf = require('./conf')
  express = require('express')
  mongoose = require('mongoose');

  # TO FIX: Abandoned in favor of everyauth
  # function bootPassport(app) {

  #   var passport = require('passport')
  #     , facebook_strategy = require('passport-facebook').Strategy

  #   app.use(passport.initialize());
  #   app.use(passport.session());

  #   passport.use(new facebook_strategy({
  #       clientID: conf.fb.appId,
  #       clientSecret: conf.fb.appSecret,
  #       # callbackURL: "http:#cashtracker.nodejitsu.com/auth/facebook/callback"
  #       callbackURL: conf.domain + "/auth/facebook/callback"
  #     },
  #     function(accessToken, refreshToken, profile, done) {
  #       User.findOrCreate({ facebookId: profile.id }, function (err, user) {
  #         return done(err, user);
  #       });
  #     }
  #   ));

  #   app.get('/auth/facebook',
  #     passport.authenticate('facebook'),
  #     function(req, res){
  #       # The request will be redirected to Facebook for authentication, so
  #       # this function will not be called.
  #     });

  #   app.get('/auth/facebook/callback', 
  #     passport.authenticate('facebook', { failureRedirect: conf.domain + '/login' }),
  #     function(req, res) {
  #       # Successful authentication, redirect home.
  #       res.redirect(conf.domain);
  #     });

  #   app.get('/login', function(req, res){
  #     res.render('login', { user: req.user });
  #   });

  #   # Passport session setup.
  #   #   To support persistent login sessions, Passport needs to be able to
  #   #   serialize users into and deserialize users out of the session.  Typically,
  #   #   this will be as simple as storing the user ID when serializing, and finding
  #   #   the user by ID when deserializing.  However, since this example does not
  #   #   have a database of user records, the complete Facebook profile is serialized
  #   #   and deserialized.
  #   passport.serializeUser(function(user, done) {
  #     done(null, user);
  #   });

  #   passport.deserializeUser(function(obj, done) {
  #     done(null, obj);
  #   });

  # }

  mongoose.connect(conf.database);

  UserSchema = new mongoose.Schema({
    name        : String
  });
  mongoose.model 'User', UserSchema
  User = mongoose.model 'User'

  usersByFbId = {};
  usersById = {};
  nextUserId = 0;

  addUser = (source, sourceUser) ->
    
    if (arguments.length == 1)
      user = sourceUser = source
      user.id = ++nextUserId
      return usersById[nextUserId] = user
    else
      user = usersById[++nextUserId] = { id: nextUserId };
      user[source] = sourceUser;
    
    return user;

  getUser = (id, callback) ->
    console.log "getting user of id: " + id
    User.findOne { id: id }, (error, result) -> 
      if error
        console.log "Error getting user: " + error
      
      console.log "results: " + result
      
      if !callback console.log "Warning: user requested without callback"
      else callback result;

  @bootEveryAuth: (app) ->

    everyauth = require('everyauth');

    everyauth.everymodule.findUserById (userId, callback) ->
      console.log('Z Z Z');
      console.log('findUserById - userId: ' + userId);
      console.log('Z Z Z');

      user = usersById[userId];
      for name in user.facebook
        console.log(name + " : " + user.facebook[name])

      console.log('user: ' + user.facebook.name);
      everyauth.user = user;
    
      callback null, { userId: userId }

    daisyChain = everyauth.facebook.appId(conf.fb.appId).appSecret(conf.fb.appSecret).findOrCreateUser (session, accessToken, accessTokenExtra, fbUserMetadata) ->
      getUser fbUserMetadata.id, (result) ->
        if !result
          new User( { name: fbUserMetadata.name }).save();

      return usersByFbId[fbUserMetadata.id] ||
        (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));

    daisyChain.redirectPath conf.domain

    # # everyauth.everymodule.findUserById( function (userId, callback) {
    # #   User.findById(userId, callback);
    # #   # callback has the signature, function (err, user) {...}
    # # });

    app.use everyauth.middleware()

    everyauth.helpExpress app  

class db

  mongoose = require 'mongoose'
  conf = require './conf'

  # Mongodb schema

  Schema = mongoose.Schema
    
  BillSchema = new Schema({
    serial        : String,
    denomination  : Number,
    currency      : String
  });

  SightingSchema = new Schema({
    serial        : String,
    latitude      : Number,
    longitude     : Number,
    comment     : String
  });

  mongoose.model 'Bill', BillSchema
  Bill = mongoose.model 'Bill'

  mongoose.model 'Sighting', SightingSchema
  Sighting = mongoose.model 'Sighting'

  @connect: ->
    mongoose.connect conf.database
    console.log "MongoDB connection success..."

  @prepopulate: ->

    console.log "Checking for existing data..."

    Sighting.findOne null, (error, result) ->
      if result console.log "Found a sighting... skipping dummy data creation..."
      else
        console.log "No sightings found, filling with dummy data..."

        new Bill( { serial: 'X18084287225', denomination: 20, currency: 'euro' } ).save();
        new Bill( { serial: 'Y81450250492', denomination: 10, currency: 'euro' } ).save();
     
        new Sighting( { serial: 'X18084287225', latitude: "41.377301033335414", longitude: "2.189307280815329", comment: 'I got this from my mother' } ).save();
        new Sighting( { serial: 'Y81450250492', latitude: "31.377301033335414", longitude: "-32.189307280815329", comment: 'I got this from a restaurant' } ).save();
        new Sighting( { serial: 'Y81450250492', latitude: "-41.377301033335414", longitude: "9.189307280815329", comment: 'I got this from a bar' } ).save();
        new Sighting( { serial: 'Y81450250492', latitude: "11.377301033335414", longitude: "12.189307280815329", comment: 'I got this from somewhere' } ).save();

        console.log "Dummy data created..."


# require('zappa') ->

#  @use 'bodyParser', 'cookieParser', 'methodOverride', @app.router, static: __dirname + '/public'

  # @use 'bodyParser', 'cookieParser', 'methodOverride', session: { secret: 'bunniesonfire' }, @app router, static: __dirname + '/public'

  # @configure
  #   development: => @use errorHandler: {dumpExceptions: on}
  #   production: => @use 'errorHandler'

db.connect
db.prepopulate

express = require('express');
app = express.createServer()
app.use(express.logger(':method :url :status'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'bunniesonfire' }));
app.use(app.router);
app.use(express.static(__dirname + '/public'));

conf = require './conf'
# set 'views': __dirname + '/views/' + conf.template_engine
# set 'view engine': conf.template_engine
# get '/': -> render 'index.jade'

app.set('views', __dirname + '/views/' + conf.template_engine);
app.set('view engine', conf.template_engine);

auth.bootEveryAuth app

# Example 500 page
app.error = (err, req, res) -> render '500'

# TO FIX: 404 not hooked up right since coffeescript migration. Confusion between use and app.use
# Example 404 page via simple Connect middleware
# use(function(req, res){
#   res.render('404');
# });

hasMessages = (req) ->
  if !req.session
    return false
  huh = Object.keys req.session.flash || {}
  return huh.length;

request = (req) ->
  return req;

messages = (req) ->
  return ->
    msgs = req.flash()
    temp1 = Object.keys(msgs)
    return temp1.reduce ((arr, type) ->
      return arr.concat msgs[type]
    ), []

app.dynamicHelpers { hasMessages, request, messages }

mvc.bootControllers app

app.listen(3000);