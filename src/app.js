(function() {
  var Auth, DB, MVC, app, config, express, hasMessages, messages, request, w;

  w = require('winston');

  DB = require('./db');

  MVC = require('./mvc');

  Auth = require('./auth');

  config = require('./config_' + process.env['NODE_ENV']);

  if (config.logging) {
    if (config.logging.logfile) w.add(w.transports.File, config.logging.logfile);
    if (config.logging.loggly) w.add(w.transports.Loggly, config.logging.loggly);
  }

  w.info("=============================================");

  w.info("Starting CashTracker in NODE_ENV: " + process.env['NODE_ENV']);

  w.info("=============================================");

  DB.connect(config.database);

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

  Auth.bootEveryAuth(app, config.creds);

  app.use(app.router);

  app.use(express.static(__dirname + '/public'));

  app.set('views', __dirname + '/views/' + config.template_engine);

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

  app.dynamicHelpers({
    hasMessages: hasMessages,
    request: request,
    messages: messages
  });

  MVC.bootControllers(app, config.template_engine);

  app.listen(3000);

}).call(this);
