model = require '../src/coffee/model'

should = require 'should'

describe 'Geography', () ->
  describe 'a new sighting model', () ->
    it 'should exist', ->
      new model.sighting().should.exist
    it 'should provide a date by default', ->
      new model.sighting().date.should.exist
    it 'should provide a save method', ->
      new model.sighting().save.should.exist