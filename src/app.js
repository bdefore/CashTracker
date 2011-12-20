(function() {
  var Auth, DB, MVC, app, conf, express, hasMessages, messages, request;

  DB = require('./db');

  MVC = require('./mvc');

  Auth = require('.auth');

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
