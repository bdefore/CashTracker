fs = require 'fs'
should = require 'should'

# getConfigSync = (name) ->
#   return fs.readFileSync __dirname + '/../src/config/' + name + '.json', 'utf8'

getConfigAsync = (name, callback) ->
  fs.readFile __dirname + '/../src/config/' + name + '.json', callback

describe 'Configuration', () ->
  describe 'NODE_ENV', ->
    it 'exists', ->
      process.env['NODE_ENV'].should.exist
  describe 'current environment', ->
    # config = getConfigSync process.env['NODE_ENV']
    getConfigAsync process.env['NODE_ENV'], (err, result) ->
      config = JSON.parse(result)
      it 'exists', ->
        should.not.exist err
        should.exist result
      it 'parses', ->
        should.exist config
      it 'has a database path', ->
        should.exist config.database
      it 'has a template engine', ->
        should.exist config.template_engine
  describe 'development environment', ->
    getConfigAsync 'development', (err, result) ->
      config = JSON.parse(result)
      it 'exists', ->
        should.not.exist err
        should.exist result
      it 'parses', ->
        should.exist config
      it 'has a database path', ->
        should.exist config.database
      it 'has a template engine', ->
        should.exist config.template_engine
  describe 'production environment', ->
    getConfigAsync 'production', (err, result) ->
      config = JSON.parse(result)
      it 'exists', ->
        should.not.exist err
        should.exist result
      it 'parses', ->
        should.exist config
      it 'has a database path', ->
        should.exist config.database
      it 'has a template engine', ->
        should.exist config.template_engine
  describe 'fake environment', ->
    getConfigAsync 'bunniesonfire', (err, result) ->
      it 'does not exist', ->
        should.exist err
        should.not.exist result