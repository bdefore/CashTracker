(function() {
  var Auth;

  module.exports = Auth = (function() {
    var addUser, express, getStoredUser, model, nextUserId, usersByFbId, usersById, w;

    function Auth() {}

    w = require('winston');

    express = require('express');

    model = require('./model');

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
      w.info('-> addUser: adding user of id: ' + user.id);
      return user;
    };

    getStoredUser = function(id, callback) {
      return model.user.findOne({
        fbId: id
      }, function(error, result) {
        if (error) w.info("Error getting user: " + error);
        if (!callback) {
          return w.info("Warning: user requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    Auth.processFacebookResponse = function(session, token, extra, fbUserMetadata) {
      var userByFbId;
      w.info("Checking to see if we have FB user: " + fbUserMetadata.id);
      w.info(fbUserMetadata);
      getStoredUser(fbUserMetadata.id, function(result) {
        var u;
        if (!result) {
          w.info("Is new user record");
          u = new model.user({
            name: fbUserMetadata.name,
            fbId: fbUserMetadata.id
          });
          return u.save(function(err) {
            if (err) {
              return w.error("Failed to save user record");
            } else {
              return w.info("Successful save of user record");
            }
          });
        } else {
          return w.info("Stored user record found");
        }
      });
      userByFbId = usersByFbId[fbUserMetadata.id];
      if (!userByFbId) {
        userByFbId = usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata);
      }
      return userByFbId;
    };

    Auth.bootEveryAuth = function(app, creds) {
      var daisyChain, everyauth;
      everyauth = require('everyauth');
      everyauth.everymodule.findUserById(function(userId, callback) {
        return model.user.findOne(userId, callback);
      });
      daisyChain = everyauth.facebook.appId(creds.fb.appId).appSecret(creds.fb.appSecret).findOrCreateUser(this.processFacebookResponse);
      daisyChain.redirectPath(creds.domain + "/account");
      app.use(everyauth.middleware());
      return everyauth.helpExpress(app);
    };

    return Auth;

  })();

}).call(this);
