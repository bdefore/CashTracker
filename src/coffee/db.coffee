module.exports = class DB

  mongoose = require 'mongoose'
  conf = require './conf'

  # Mongodb schema

  @Bill = mongoose.model 'Bill' , new mongoose.Schema {
    # _id           : String, # assigned by mongodb
    serial        : String,
    denomination  : Number,
    currency      : { type: String, default: "Euro" }
  }

  @Sighting = mongoose.model 'Sighting', new mongoose.Schema {
    # _id           : String, # assigned by mongodb
    date          : { type: Date, default: Date.now }
    serial        : String,
    latitude      : Number,
    longitude     : Number,
    comment       : String,
    submitterId   : String
  }

  # ===================
  # Begin service logic
  # ===================

  @debug = true

  @getBills: (filterBySerial, callback) =>
    console.log "getBills serial: " + filterBySerial \
      + " (or all if serial is null)"
    filter = {}
    if filterBySerial
      filter = { serial: filterBySerial }
    @Bill.find filter, (error, result) =>
      if error
        console.log "getBills error: " + error
      console.log "getBills results: " + result
      if !callback
        console.log "Warning: getBills requested without callback"
      else
        callback result

  @getBillBySerial: (filterBySerial, callback) =>
    console.log "getBillBySerial serial: " + filterBySerial
    @Bill.findOne { serial: filterBySerial }, (error, result) =>
      if error
        console.log "getBillBySerial error: " + error
      console.log "getBillBySerial results: " + result
      if !callback
        console.log "Warning: getBillBySerial requested without callback"
      else
        callback error, result

  @getSightings: (filterById, callback) =>
    console.log "getSightings id: " + filterById + " (or all if id is null)"
    filter = {}
    if filterById
      filter = { _id: filterById }
    @Sighting.find filter, (error, result) =>
      if error
        console.log "getSightings error: " + error
      console.log "getSightings results: " + result
      if !callback
        console.log "Warning: getSightings requested without callback"
      else
        callback result

  @getSightingsBySerial: (filterBySerial, callback) =>
    console.log "getSightingsBySerial serial: " + filterBySerial \
      + " (or all if serial is null)"
    filter = {}
    if filterBySerial
      filter = { serial: filterBySerial }
    @Sighting.find filter, (error, result) =>
      if error
        console.log "getSightingsBySerial error: " + error
      console.log "getSightingsBySerial results: " + result
      if !callback
        console.log "Warning: getSightingsBySerial requested without callback"
      else
        callback result

  @getSightingsBySubmitter: (filterBySubmitterId, callback) =>
    console.log "getSightingsBySubmitter id: " + filterBySubmitterId \
      + " (or all if id is null)"
    filter = {}
    if filterBySubmitterId
      filter = { submitterId: filterBySubmitterId }
    @Sighting.find filter, (error, result) =>
      if error
        console.log "getSightingsBySubmitter error: " + error
      console.log "getSightingsBySubmitter results: " + result
      if !callback
        console.log "Warning: getSightingsBySubmitter requested sin callback"
      else
        callback result

  # No longer used?
  #
  # function getUser(id, callback) {
  #   console.log("getting user of id: " + id)
  #   User.findOne( { id: id }, function(error, result) {
  #     if(error) console.log("Error getting user: " + error)
  #     console.log("results: " + result)
  #     if(!callback) console.log("Warning: sightings requested sin callback")
  #     else callback(result)
  #   })
  # }

  # ===================
  # End service logic
  # ===================

  @connect: () =>
    mongoose.connect conf.database
    console.log "MongoDB connection success..."

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

    sighting = new @Sighting
      serial: fakeSerial
      latitude: @getRandomCoordinate()
      longitude: @getRandomCoordinate()
      comment: fakeComment

  @prepopulate: () =>

    console.log "Checking for existing data..."

    @Sighting.findOne null, (error, result) =>
      if result
        console.log "Found a sighting... skipping dummy data creation..."
      else
        console.log "No sightings found, filling with dummy data..."

        for n in [0..10]
          s = @getRandomSighting()
          b = new @Bill
            serial: s.serial
            denomination: 20
            currency: 'Euro'
          b.save()
          s.save()

          console.log 'Adding dummy sighting: ' + s

        console.log "Dummy data created..."