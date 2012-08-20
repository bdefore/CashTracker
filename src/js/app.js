(function() {
  var auth, db, fs, mvc, pathToConfig, w;

  w = require('winston');

  fs = require('fs');

  db = require('./db');

  mvc = require('./mvc');

  auth = require('./auth');

  pathToConfig = __dirname + '/../config/' + process.env['NODE_ENV'] + '.json';

  w.warn("====================");

  w.warn("Starting CashTracker");

  w.warn("====================");

  w.info("Loading configuration from: " + pathToConfig);

  fs.readFile(pathToConfig, function(error, data) {
    var app, baseDir, config, express, hasMessages, messages, request;
    if (error) {
      w.error(error);
      return w.error("Be sure you have specified NODE_ENV!");
    } else {
      config = JSON.parse(data);
      w.info("Configuration file loaded: " + config);
      w.warn("=============================================");
      w.warn("Starting CashTracker in NODE_ENV: " + process.env['NODE_ENV']);
      w.warn("=============================================");
      db.connect("mongodb://bdefore:ieq3o42h@alex.mongohq.com:10001/app6881560");
      db.prepopulate();
      baseDir = __dirname + "/..";
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
      auth.bootEveryAuth(app, config.creds);
      app.use(app.router);
      app.use(express.static(baseDir + '/public'));
      app.set('views', baseDir + '/views/' + config.template_engine);
      app.set('view engine', config.template_engine);
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
      mvc.bootControllers(app, config.template_engine);
      return app.listen(process.env.PORT);
    }
  });

}).call(this);
