# http://ariejan.net/2011/06/10/vows-and-coffeescript

vows = require 'vows'
assert = require 'assert'

DB = require '../src/db'

vows
  .describe('Geography related')
  .addBatch
    'Provides a basic sighting model':
      topic: -> new DB.Sighting

      'exists': (sighting) ->
        assert.isNotNull sighting
      'provides a date by default': (sighting) ->
        assert.isNotNull sighting.date
      'does not presume latitude or longitude': (sighting) ->
        assert.isUndefined sighting.latitude && assert.isUndefined sighting.longitude
      'has the ability to save': (sighting) ->
        assert.isNotNull sighting.save

  .export(module)