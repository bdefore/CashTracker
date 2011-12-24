fs = require 'fs'
should = require 'should'
mongoose = require 'mongoose'

db = require '../src/coffee/db'

pathToConfig = __dirname + '/../src/config/' + process.env['NODE_ENV'] + '.json'

config = JSON.parse fs.readFileSync pathToConfig, 'utf8'

describe 'Database', () ->
  describe 'connection', () ->
    it 'has connect method', ->
      should.exist db.connect
    it 'has disconnect method', ->
      should.exist db.disconnect
    it 'should connect without error from config', (done) ->
      db.connect config.database, (err) ->
        should.not.exist err
        done()
    it 'should fail to connect without fake path', (done) ->
      db.connect 'mongodb://bunnies/onfire', (err, result) ->
        if !err
          throw err
        should.not.exist result
        done()