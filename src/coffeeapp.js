(function() {
  var Auth, DB, MVC, app, conf, express, hasMessages, messages, request;

  MVC = (function() {
    var bootController, conf, connect, controllerAction, express;

    function MVC() {}

    conf = require('./conf');

    connect = require('connect');

    express = require('express');

    MVC.bootControllers = function(app) {
      var fs;
      fs = require('fs');
      return fs.readdir(__dirname + '/controllers', function(err, files) {
        if (err) throw err;
        return files.forEach(function(file) {
          return bootController(app, file);
        });
      });
    };

    bootController = function(app, file) {
      var actions, name, plural, prefix;
      name = file.replace('.js', '');
      actions = require('./controllers/' + name);
      plural = name + 's';
      prefix = '/' + plural;
      if (name === 'app') prefix = '/';
      if (name === 'account') {
        plural = name;
        prefix = "/account";
      }
      return Object.keys(actions).map(function(action) {
        var fn;
        fn = controllerAction(name, plural, action, actions[action]);
        switch (action) {
          case 'index':
            return app.get(prefix, fn);
          case 'add':
            return app.get(prefix + '/add', fn);
          case 'show':
            return app.get(prefix + '/:id.:format?', fn);
          case 'create':
            return app.post(prefix + '/:id', fn);
          case 'edit':
            return app.get(prefix + '/:id/edit', fn);
          case 'update':
            return app.put(prefix + '/:id', fn);
          case 'destroy':
            return app.del(prefix + '/:id', fn);
        }
      });
    };

    controllerAction = function(name, plural, action, fn) {
      return function(req, res, next) {
        var format, path, render;
        render = res.render;
        format = req.params.format;
        path = __dirname + '/views/' + conf.template_engine + '/' + name + '/' + action + '.' + conf.template_engine;
        res.render = function(obj, options, fn) {
          res.render = render;
          if (typeof obj === 'string') return res.render(obj, options, fn);
          if (action === 'show' && format) {
            if (format === 'json') {
              return res.send(obj);
            } else {
              throw new Error('unsupported format "' + format + '"');
            }
          }
          res.render = render;
          options = options || {};
          if (action === 'index') {
            options[plural] = obj;
          } else {
            options[name] = obj;
          }
          return res.render(path, options, fn);
        };
        return fn.apply(this, arguments);
      };
    };

    return MVC;

  })();

  Auth = (function() {
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

  DB = require('./db');

  console.log(DB);

  DB.connect();

  DB.prepopulate();

  express = require('express');

  app = express.createServer();

  app.use(express.logger(':method :url :status'));

  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));

  app.use(express.bodyParser());

  app.use(express.methodOverride());

  app.use(express.cookieParser());

  app.use(express.favicon());

  app.use(express.session({
    secret: 'bunniesonfire'
  }));

  Auth.bootEveryAuth(app);

  app.use(app.router);

  app.use(express.static(__dirname + '/public'));

  conf = require('./conf');

  app.set('views', __dirname + '/views/' + conf.template_engine);

  app.set('view engine', conf.template_engine);

  app.error = function(err, req, res) {
    return render('500');
  };

  hasMessages = function(req) {
    var huh;
    if (!req.session) return false;
    huh = Object.keys(req.session.flash || {});
    return huh.length;
  };

  request = function(req) {
    return req;
  };

  messages = function(req) {
    return function() {
      var msgs, temp1;
      msgs = req.flash();
      temp1 = Object.keys(msgs);
      return temp1.reduce((function(arr, type) {
        return arr.concat(msgs[type]);
      }), []);
    };
  };

  app.dynamicHelpers({
    hasMessages: hasMessages,
    request: request,
    messages: messages
  });

  MVC.bootControllers(app);

  app.listen(3000);

}).call(this);
