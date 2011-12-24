fs = require 'fs'
should = require 'should'
mongoose = require 'mongoose'

db = require '../src/coffee/db'
model = require '../src/coffee/model'

pathToConfig = __dirname + '/../src/config/' + process.env['NODE_ENV'] + '.json'

config = JSON.parse fs.readFileSync pathToConfig, 'utf8'

describe 'Model', () ->
  describe 'Sighting', () ->

    sighting = new model.sighting()

    before (done) ->
      db.connect config.database, (err) ->
        done()

    it 'new sighting has date assigned automatically', ->
      should.exist sighting.date

    it 'new sighting has id assigned automatically', ->
      should.exist sighting.id

    it 'new sighting does not have latitude/longitude assigned automatically', ->
      should.not.exist sighting.longitude
      should.not.exist sighting.latitude

    it 'can save new entry', (done) ->
      sighting.save (err) ->
        should.not.exist err
        done()

    it 'new sighting ID will not exist in existing DB entries before adding', (done) ->
        model.sighting.findById new model.sighting().id, (err, result) ->
          should.not.exist err
          should.not.exist result
          done()

    it 'can be found by ID after saving', (done) ->
      model.sighting.findById sighting.id, (err, result) ->
        should.not.exist err
        should.exist result
        done()

    after (done) ->
      db.disconnect (err) ->
        done()

  describe 'Bill', () ->

    bill = new model.bill()

    before (done) ->
      db.connect config.database, (err) ->
        done()

    it 'can save new entry', (done) ->
      bill.save (err) ->
        should.not.exist err
        done()

    after (done) ->
      db.disconnect (err) ->
        done()

  describe 'User', () ->

    user = new model.user()

    before (done) ->
      db.connect config.database, (err) ->
        done()

    it 'can save new entry', (done) ->
      user.save (err) ->
        should.not.exist err
        done()

    after (done) ->
      db.disconnect (err) ->
        done()      