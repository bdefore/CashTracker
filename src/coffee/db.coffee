module.exports = class DB

  w = require 'winston'
  mongoose = require 'mongoose'

  model = require './model'
  
  @connect: (path) =>
    mongoose.connect path
    w.info "MongoDB connection success..."

  # TO FIX: These shouldn't be publicly exposed (@ prefix) but the scope
  # of prepopulate's sighting.findOne callback is doing something surprising

  @alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  @getRandomLetter: () =>
    @alphabet[Math.floor(Math.random() * @alphabet.length)]

  @getRandomDigit: () =>
    Math.floor Math.random() * 10

  @getRandomCoordinate: () =>
    (Math.random() * 180) - 90

  @getRandomSighting: () =>

    # Euro serial is letter followed by 11 digits
    fakeSerial = @getRandomLetter().toUpperCase()
    fakeSerial += @getRandomDigit() for n in [0..10]

    fakeComment = ""
    fakeComment += @getRandomLetter() for n in [0..20]

    sighting = new model.sighting
      serial: fakeSerial
      latitude: @getRandomCoordinate()
      longitude: @getRandomCoordinate()
      comment: fakeComment

  @prepopulate: () =>

    w.info "Checking for existing data..."

    model.sighting.findOne null, (error, result) =>
      if result
        w.info "Found a sighting... skipping dummy data creation..."
      else
        w.info "No sightings found, filling with dummy data..."

        for n in [0..10]
          s = @getRandomSighting()
          b = new model.bill
            serial: s.serial
            denomination: 20
            currency: 'Euro'
          b.save()
          s.save()

          w.info 'Adding dummy sighting: ' + s

        w.info "Dummy data created..."