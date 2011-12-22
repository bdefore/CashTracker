(function() {
  var app, auth, config, db, express, hasMessages, messages, mvc, request, w;

  w = require('winston');

  db = require('./db');

  mvc = require('./mvc');

  auth = require('./auth');

  config = require('./config_' + process.env['NODE_ENV']);

  if (config.logging) {
    if (config.logging.console) {
      w.remove(w.transports.Console);
      w.add(w.transports.Console, config.logging.console);
    }
    if (config.logging.logfile) w.add(w.transports.File, config.logging.logfile);
    if (config.logging.loggly) w.add(w.transports.Loggly, config.logging.loggly);
  }

  w.warn("=============================================");

  w.warn("Starting CashTracker in NODE_ENV: " + process.env['NODE_ENV']);

  w.warn("=============================================");

  db.connect(config.database);

  db.prepopulate();

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

  mvc.bootControllers(app, config.template_engine);

  app.listen(3000);

}).call(this);
