# http://ariejan.net/2011/06/10/vows-and-coffeescript

vows = require 'vows'
assert = require 'assert'
mongoose = require 'mongoose'

config = require '../src/config_development'
DB = require '../src/db'

vows
  .describe('Data service related')
  .addBatch
    'Configuration file':
      topic: -> config
      'can be found': (topic) ->
        assert.isNotNull topic
      'has a database': (topic) ->
        assert.isString topic.database
      'has a template engine': (topic) ->
        assert.isString topic.template_engine
  .addBatch
    'Mongoose (MongoDB) connection test with config':
      topic: -> mongoose.connect config.database, this.callback

      'results in successful connection': (err, result) ->
        assert.isNull err

  .export(module)