(function() {
  var Auth;

  module.exports = Auth = (function() {
    var User, UserSchema, addUser, conf, express, fs, getStoredUser, mongoose, nextUserId, usersByFbId, usersById;

    function Auth() {}

    fs = require('fs');

    conf = require('./conf');

    express = require('express');

    mongoose = require('mongoose');

    mongoose.connect(conf.database);

    UserSchema = new mongoose.Schema({
      name: String,
      fbId: Number
    });

    mongoose.model('User', UserSchema);

    User = mongoose.model('User');

    usersByFbId = {};

    usersById = {};

    nextUserId = 0;

    addUser = function(source, sourceUser) {
      var user;
      if (arguments.length === 1) {
        user = sourceUser = source;
        user.id = ++nextUserId;
        return usersById[nextUserId] = user;
      } else {
        user = usersById[++nextUserId] = {
          id: nextUserId
        };
        user[source] = sourceUser;
      }
      console.log('-> addUser: adding user of id: ' + user.id);
      return user;
    };

    getStoredUser = function(id, callback) {
      return User.findOne({
        fbId: id
      }, function(error, result) {
        if (error) console.log("Error getting user: " + error);
        if (!callback) {
          return console.log("Warning: user requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    Auth.bootEveryAuth = function(app) {
      var daisyChain, everyauth, facebookResponseCallback;
      everyauth = require('everyauth');
      everyauth.everymodule.findUserById(function(userId, callback) {
        return User.findOne(userId, callback);
      });
      facebookResponseCallback = function(session, token, extra, fbUserMetadata) {
        var userByFbId;
        console.log("Checking to see if we have FB user: " + fbUserMetadata.id);
        console.log(fbUserMetadata);
        getStoredUser(fbUserMetadata.id, function(result) {
          var u;
          if (!result) {
            console.log("Is new user record");
            u = new User({
              name: fbUserMetadata.name,
              fbId: fbUserMetadata.id
            });
            return u.save();
          } else {
            return console.log("Stored user record found");
          }
        });
        userByFbId = usersByFbId[fbUserMetadata.id];
        if (!userByFbId) {
          userByFbId = usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata);
        }
        return userByFbId;
      };
      daisyChain = everyauth.facebook.appId(conf.fb.appId).appSecret(conf.fb.appSecret).findOrCreateUser(facebookResponseCallback);
      daisyChain.redirectPath(conf.domain + "/account");
      app.use(everyauth.middleware());
      return everyauth.helpExpress(app);
    };

    return Auth;

  })();

}).call(this);
