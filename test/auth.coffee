fs = require 'fs'
should = require 'should'
everyauth = require 'everyauth'

db = require '../src/coffee/db'
model = require '../src/coffee/model'
auth = require '../src/coffee/auth'

pathToConfig = __dirname + '/../src/config/test.json'

config = JSON.parse fs.readFileSync pathToConfig, 'utf8'

user = new model.user()
fbRes = 
  name: "Mickey Mouse"
  id: Math.random() * 100000
userFromDb = {}

describe 'Auth', () ->
  describe 'user creation', () ->

    before (done) ->
      db.connect config.database, (err) ->
        done()

    it 'stores facebook response', (done) ->

      auth.processFacebookResponse null, null, null, fbRes

      findNewlyCreatedUser = ->
        model.user.findOne { fbId: fbRes.id }, (err, result) ->
          should.not.exist err
          userFromDb = result
          done()
      
      # TO FIX: A callback way of doing this, rather than relying
      # on setTimeout. Unfortunately may require digging into
      # everyauth logic
      setTimeout findNewlyCreatedUser, 20

    describe 'newly created user', () ->
      before (done) ->
        done()

      it 'exists', ->
        should.exist userFromDb
      it 'has an assigned id', ->
        should.exist userFromDb.id
      it 'has same FB ID as what we sent server', ->
        should.equal fbRes.id, userFromDb.fbId
      it 'has different id than FB ID', ->
        userFromDb.id == fbRes.id.should.not.be.true

    after (done) ->
      db.disconnect (err) ->
        done()