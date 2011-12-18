var fs = require('fs')
  , conf = require('./conf')
  , express = require('express')
  , mongoose = require('mongoose');

exports.boot = function(app){
  // bootPassport(app);
  bootEveryAuth(app);
};

function bootPassport(app) {

  var passport = require('passport')
    , facebook_strategy = require('passport-facebook').Strategy

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new facebook_strategy({
      clientID: conf.fb.appId,
      clientSecret: conf.fb.appSecret,
      // callbackURL: "http://cashtracker.nodejitsu.com/auth/facebook/callback"
      callbackURL: conf.domain + "/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return done(err, user);
      });
    }
  ));

  app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res){
      // The request will be redirected to Facebook for authentication, so
      // this function will not be called.
    });

  app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { failureRedirect: conf.domain + '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect(conf.domain);
    });

  app.get('/login', function(req, res){
    res.render('login', { user: req.user });
  });

  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.  However, since this example does not
  //   have a database of user records, the complete Facebook profile is serialized
  //   and deserialized.
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

}

var usersByFbId = {};
var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

function getUser(id, callback) {
  console.log("getting user of id: " + id)
  User.findOne( { id: id }, function(error, result) {
    if(error) console.log("Error getting user: " + error);
    console.log("results: " + result)
    if(!callback) console.log("Warning: user requested without callback")
    else callback(result);
  });
}

mongoose.connect(conf.database);

var UserSchema = new mongoose.Schema({
  name        : String
});
mongoose.model('User', UserSchema);
var User = mongoose.model('User');

function bootEveryAuth(app) {

  var everyauth = require('everyauth');

  everyauth.everymodule
    .findUserById( function (userId, callback) {
      console.log('Z Z Z');
      console.log('findUserById - userId: ' + userId);
      console.log('Z Z Z');

      var user = usersById[userId];
      for(var name in user.facebook)
      {
        console.log(name + " : " + user.facebook[name])
      }
      console.log('user: ' + user.facebook.name);
      everyauth.user = user;
    
      callback(null, { userId: userId });
    });

  everyauth
    .facebook
      .appId(conf.fb.appId)
      .appSecret(conf.fb.appSecret)
      .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
        getUser(fbUserMetadata.id, function(result) {
          if(!result)
          {
            new User( { name: fbUserMetadata.name }).save();
          }
        });

        return usersByFbId[fbUserMetadata.id] ||
          (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
      })
      .redirectPath(conf.domain);

  // everyauth.everymodule.findUserById( function (userId, callback) {
  //   User.findById(userId, callback);
  //   // callback has the signature, function (err, user) {...}
  // });

  app.use(everyauth.middleware());

  everyauth.helpExpress(app);
}