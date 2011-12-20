(function() {
  var MVC;

  module.exports = MVC = (function() {
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

}).call(this);
