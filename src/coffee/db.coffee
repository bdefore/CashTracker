module.exports = class DB

  w = require 'winston'
  mongoose = require 'mongoose'
  
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

  @User = mongoose.model 'User', new mongoose.Schema {
    name        : String,
    fbId        : Number
  }

  # ===================
  # Begin service logic
  # ===================

  @DATA_SERVICE_DEBUG = false

  @getBills: (filterBySerial, callback) =>
    if @DATA_SERVICE_DEBUG
      w.info "getBills serial: " + filterBySerial \
      + " (or all if serial is null)"
    filter = {}
    if filterBySerial
      filter = { serial: filterBySerial }
    @Bill.find filter, (error, result) =>
      if error
        if @DATA_SERVICE_DEBUG
          w.info "getBills error: " + error
      if @DATA_SERVICE_DEBUG
        w.info "getBills results: " + result
      if !callback
        if @DATA_SERVICE_DEBUG
          w.info "Warning: getBills requested without callback"
      else
        callback result

  @getBillBySerial: (filterBySerial, callback) =>
    if @DATA_SERVICE_DEBUG
      w.info "getBillBySerial serial: " + filterBySerial
    @Bill.findOne { serial: filterBySerial }, (error, result) =>
      if error
        if @DATA_SERVICE_DEBUG
          w.info "getBillBySerial error: " + error
      if @DATA_SERVICE_DEBUG
          w.info "getBillBySerial results: " + result
      if !callback
        if @DATA_SERVICE_DEBUG
          w.info "Warning: getBillBySerial requested without callback"
      else
        callback error, result

  @getSightings: (filterById, callback) =>
    if @DATA_SERVICE_DEBUG
      w.info "getSightings id: " + filterById + " (or all if id is null)"
    filter = {}
    if filterById
      filter = { _id: filterById }
    @Sighting.find filter, (error, result) =>
      if error
        if @DATA_SERVICE_DEBUG
          w.info "getSightings error: " + error
      if @DATA_SERVICE_DEBUG
          w.info "getSightings results: " + result
      if !callback
        if @DATA_SERVICE_DEBUG
          w.info "Warning: getSightings requested without callback"
      else
        callback result

  @getSightingsBySerial: (filterBySerial, callback) =>
    if @DATA_SERVICE_DEBUG
      w.info "getSightingsBySerial serial: " + filterBySerial \
      + " (or all if serial is null)"
    filter = {}
    if filterBySerial
      filter = { serial: filterBySerial }
    @Sighting.find filter, (error, result) =>
      if error
        if @DATA_SERVICE_DEBUG
          w.info "getSightingsBySerial error: " + error
      if @DATA_SERVICE_DEBUG
        w.info "getSightingsBySerial results: " + result
      if !callback
        if @DATA_SERVICE_DEBUG
          w.info "Warning: getSightingsBySerial requested without callback"
      else
        callback result

  @getSightingsBySubmitter: (filterBySubmitterId, callback) =>
    if @DATA_SERVICE_DEBUG
      w.info "getSightingsBySubmitter id: " + filterBySubmitterId \
      + " (or all if id is null)"
    filter = {}
    if filterBySubmitterId
      filter = { submitterId: filterBySubmitterId }
    @Sighting.find filter, (error, result) =>
      if error
        if @DATA_SERVICE_DEBUG
          w.info "getSightingsBySubmitter error: " + error
      if @DATA_SERVICE_DEBUG
        w.info "getSightingsBySubmitter results: " + result
      if !callback
        if @DATA_SERVICE_DEBUG
          w.info "Warning: getSightingsBySubmitter requested sin callback"
      else
        callback result

  # No longer used?
  #
  # function getUser(id, callback) {
  #   w.info("getting user of id: " + id)
  #   User.findOne( { id: id }, function(error, result) {
  #     if(error) w.info("Error getting user: " + error)
  #     w.info("results: " + result)
  #     if(!callback) w.info("Warning: sightings requested sin callback")
  #     else callback(result)
  #   })
  # }

  # ===================
  # End service logic
  # ===================

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

    sighting = new @Sighting
      serial: fakeSerial
      latitude: @getRandomCoordinate()
      longitude: @getRandomCoordinate()
      comment: fakeComment

  @prepopulate: () =>

    w.info "Checking for existing data..."

    @Sighting.findOne null, (error, result) =>
      if result
        w.info "Found a sighting... skipping dummy data creation..."
      else
        w.info "No sightings found, filling with dummy data..."

        for n in [0..10]
          s = @getRandomSighting()
          b = new @Bill
            serial: s.serial
            denomination: 20
            currency: 'Euro'
          b.save()
          s.save()

          w.info 'Adding dummy sighting: ' + s

        w.info "Dummy data created..."