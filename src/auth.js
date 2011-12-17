var fs = require('fs')  
  , express = require('express');

exports.boot = function(app){
  bootPassport(app);
  //bootEveryAuth(app);
};

function bootPassport(app) {

  var passport = require('passport')
    , facebook_strategy = require('passport-facebook').Strategy

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new facebook_strategy({
      clientID: "210234019058633",
      clientSecret: "8030f2759dd95d9afab2a201b68840c5",
      callbackURL: "http://cashtracker.nodejitsu.com/auth/facebook/callback"
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
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });

    // Setup ejs views as default, with .html as the extension
    app.set('views', __dirname + '/views');
    app.register('.html', require('ejs'));
    app.set('view engine', 'html');

}

function bootEveryAuth(app) {

  // var everyauth = require('everyauth');

  // app.use(everyauth.middleware());
 
     // everyauth.facebook
     //  .appId('210234019058633')
     //  .appSecret('8030f2759dd95d9afab2a201b68840c5')
     //  .handleAuthCallbackError( function (req, res) {
     //    // If a user denies your app, Facebook will redirect the user to
     //    // /auth/facebook/callback?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
     //    // This configurable route handler defines how you want to respond to
     //    // that.
     //    // If you do not configure this, everyauth renders a default fallback
     //    // view notifying the user that their authentication failed and why.
     //  })
     //  .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
     //    // find or create user logic goes here
     //  })
     //  .redirectPath('/');

  // everyauth
  //   .facebook
  //     .appId('210234019058633')
  //     .appSecret('8030f2759dd95d9afab2a201b68840c5')
  //     .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
  //       return usersByFbId[fbUserMetadata.id] ||
  //         (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
  //     })
  //     .redirectPath('/');

  // everyauth.helpExpress(app);
 
}