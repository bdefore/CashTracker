module.exports = class DB

  w = require 'winston'
  mongoose = require 'mongoose'

  model = require './model'

  @connect: (path, callback) =>
    mongoose.connect path, (err, success) ->
      if(err)
        w.error err
      else
        w.info "MongoDB connection success"
      if callback
        callback err, success
    null

  @disconnect: (callback) =>
    mongoose.disconnect callback

  @prepopulate: () =>

    w.info "Checking for existing data..."

    model.sighting.findOne null, (error, result) =>
      if result
        w.info "Found a sighting... skipping dummy data creation..."
      else
        w.info "No sightings found, filling with dummy data..."

        for n in [0..10]
          s = model.sighting.getRandom()
          b = new model.bill
            serial: s.serial
            denomination: 20
            currency: 'Euro'
          b.save()
          s.save()

          w.info 'Adding dummy sighting: ' + s

        w.info "Dummy data created..."