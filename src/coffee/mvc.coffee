module.exports = class MVC

  conf = require './conf'
  connect = require 'connect'
  express = require 'express'

  # Bootstrap controllers

  @bootControllers: (app) ->
    fs = require 'fs'
    fs.readdir __dirname + '/controllers', (err, files) ->
      if err
        throw err
      files.forEach (file) ->
        bootController app, file

  # Example (simplistic) controller support

  bootController = (app, file) ->
    name = file.replace '.js', ''
    actions = require './controllers/' + name
    plural = name + 's' # realistically we would use an inflection lib
    prefix = '/' + plural

    # Special when for "app"
    if name == 'app'
      prefix = '/'
    
    # TO FIX: Shouldn't need to hijack the nature of objects here
    # just to redirect user to their own account (there will never
    # be access to more than one at a time.
    if name == 'account'
      plural = name
      prefix = "/account"

    Object.keys(actions).map (action) ->
      fn = controllerAction name, plural, action, actions[action]
      switch action
        when 'index' then app.get prefix, fn
        when 'add' then app.get prefix + '/add', fn
        when 'show' then app.get prefix + '/:id.:format?', fn
        when 'create' then app.post prefix + '/:id', fn
        when 'edit' then app.get prefix + '/:id/edit', fn
        when 'update' then app.put prefix + '/:id', fn
        when 'destroy' then app.del prefix + '/:id', fn

  # Proxy res.render() to add some magic

  controllerAction = (name, plural, action, fn) ->
    return (req, res, next) ->
      render = res.render
      format = req.params.format
      path = __dirname + '/views/' + conf.template_engine + '/' + name + '/' +
        action + '.' + conf.template_engine

      res.render = (obj, options, fn) ->
        res.render = render

        # Template path
        if typeof obj == 'string'
          return res.render obj, options, fn

        # Format support
        if action == 'show' && format
          if format == 'json'
            return res.send obj
          else
            throw new Error 'unsupported format "' + format + '"'

        # Render template
        res.render = render
        options = options || {}

        # Expose obj as the "bills" or "bill" local
        if action == 'index'
          options[plural] = obj
        else
          options[name] = obj

        return res.render path, options, fn

      fn.apply this, arguments