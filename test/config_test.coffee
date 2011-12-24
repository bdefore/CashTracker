fs = require 'fs'
should = require 'should'

# getConfigSync = (name) ->
#   return fs.readFileSync __dirname + '/../src/config/' + name + '.json', 'utf8'

getConfigAsync = (name, callback) ->
  fs.readFile __dirname + '/../src/config/' + name + '.json', callback

describe 'Configuration', () ->
  describe 'NODE_ENV', ->
    it 'exists', ->
      should.exist process.env['NODE_ENV']
  describe 'current environment', ->
    env = process.env['NODE_ENV']
    raw = {}
    config = {}

    beforeEach (done) ->
      getConfigAsync env, (err, result) ->
        raw = result
        if raw
          config = JSON.parse raw
        done()

    it 'exists', ->
      should.exist raw
    it 'has a database path', ->
      should.exist config.database

  describe 'test environment', ->
    env = 'test'
    raw = {}
    config = {}

    beforeEach (done) ->
      getConfigAsync env, (err, result) ->
        raw = result
        if raw
          config = JSON.parse raw
        done()

    it 'exists', ->
      should.exist raw
    it 'has a database path', ->
      should.exist config.database

  describe 'development environment', ->
    env = 'development'
    raw = {}
    config = {}

    beforeEach (done) ->
      getConfigAsync env, (err, result) ->
        raw = result
        if raw
          config = JSON.parse raw
        done()

    it 'exists', ->
      should.exist raw
    it 'has a database path', ->
      should.exist config.database
    it 'has a template engine', ->
      should.exist config.template_engine

  describe 'production environment', ->
    env = 'production'
    raw = {}
    config = {}

    beforeEach (done) ->
      getConfigAsync env, (err, result) ->
        raw = result
        if raw
          config = JSON.parse raw
        done()

    it 'exists', ->
      should.exist raw
    it 'has a database path', ->
      should.exist config.database
    it 'has a template engine', ->
      should.exist config.template_engine

  describe 'fake environment', ->
    env = 'production'
    raw = {}

    beforeEach (done) ->
      getConfigAsync env, (err, result) ->
        raw = result
        done()

    it 'does not exist', ->
      should.exist raw