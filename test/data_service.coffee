fs = require 'fs'
vows = require 'vows'
assert = require 'assert'
mongoose = require 'mongoose'

db = require '../src/coffee/db'

pathToConfig = __dirname + '/../src/config/' + process.env['NODE_ENV'] + '.json'

config = JSON.parse fs.readFileSync pathToConfig, 'utf8'

if !config
  console.log "Be sure you have specified NODE_ENV!"
else
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
        topic: -> db.connect config.database, this.callback

        'results in successful connection': (err, result) ->
          assert.isNull err

    .export(module)          