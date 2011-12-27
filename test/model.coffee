fs = require 'fs'
should = require 'should'
mongoose = require 'mongoose'

db = require '../src/coffee/db'
model = require '../src/coffee/model'

pathToConfig = __dirname + '/../src/config/test.json'

config = JSON.parse fs.readFileSync pathToConfig, 'utf8'

sighting = new model.sighting()

describe 'Model', () ->
  describe 'Sighting', () ->

    before (done) ->
      db.connect config.database, (err) ->
        done()

    it 'new sighting has date assigned automatically', ->
      should.exist sighting.date

    it 'new sighting has id assigned automatically', ->
      should.exist sighting.id

    it 'new sighting does not have serial assigned automatically', ->
      should.not.exist sighting.serial

    it 'new sighting does not have latitude/longitude assigned automatically', ->
      should.not.exist sighting.longitude
      should.not.exist sighting.latitude

    it 'can be generated randomly', ->
      sighting = model.sighting.getRandom()
      should.exist sighting.latitude
      should.exist sighting.longitude
      should.exist sighting.serial
      should.exist sighting.comment

    it 'can save new entry', (done) ->
      console.dir sighting
      model.sighting.saveAndCreateBillIfNecessary sighting, (err) ->
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

    it 'has a single bill associated with it after saving', (done) ->
      model.bill.find { serial: sighting.serial }, (err, result) ->
        should.not.exist err
        should.exist result
        console.dir result
        result.length.should.equal 1
        done()

    it 'has a single bill associated with it after saving a second sighting with same serial', (done) ->
      # Create fresh random serial but reassign its serial to the one we already had
      firstSerial = sighting.serial
      sighting = model.sighting.getRandom()
      sighting.serial = firstSerial

      # Save this new one
      model.sighting.saveAndCreateBillIfNecessary sighting, (err, result) ->
        should.not.exist err
        model.bill.find { serial: sighting.serial }, (err, result) ->
          should.not.exist err
          should.exist result
          console.dir result
          # Ensure only one bill record exists, no duplication after a serial with the same number exists
          result.length.should.equal 1
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