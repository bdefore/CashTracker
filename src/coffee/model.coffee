module.exports = class Model

  @DEBUG = false

  w = require 'winston'
  mongoose = require 'mongoose'

  # TO FIX: How to split these into their own classes via CoffeeScript?

  @bill = mongoose.model 'Bill' , new mongoose.Schema {
    # _id           : String, # assigned by mongodb
    serial        : String,
    denomination  : { type: Number, default: 10 }
    currency      : { type: String, default: "Euro" }
  }

  @bill.getBillBySerial = (filterBySerial, callback) ->
    if @DEBUG
      w.info "getBillBySerial serial: " + filterBySerial
    @findOne { serial: filterBySerial }, (error, result) =>
      if error and @DEBUG
        w.info "getBillBySerial error: " + error
      if @DEBUG
        w.info "getBillBySerial results: " + result
      if !callback and @DEBUG
        w.info "Warning: getBillBySerial requested without callback"
      else
        callback error, result

  @bill.getBills = (filterBySerial, callback) ->
    if @DEBUG
      w.info "getBills serial: " + filterBySerial \
      + " (or all if serial is null)"
    filter = {}
    if filterBySerial
      filter = { serial: filterBySerial }
    @find filter, (error, result) =>
      if error and @DEBUG
        w.info "getBills error: " + error
      if @DEBUG
        w.info "getBills results: " + result
      if !callback and @DEBUG
        w.info "Warning: getBills requested without callback"
      else
        callback error, result

  @sighting = mongoose.model 'Sighting', new mongoose.Schema {
    # _id           : String, # assigned by mongodb
    date          : { type: Date, default: Date.now }
    serial        : String,
    latitude      : Number,
    longitude     : Number,
    location      : String,
    comment       : String,
    submitterId   : String
  }

  @sighting.getSightings = (filterById, callback) ->
    if @DEBUG
      w.info "getSightings id: " + filterById + " (or all if id is null)"
    filter = {}
    if filterById
      filter = { _id: filterById }
    @find filter, (error, result) =>
      if error and @DEBUG
        w.info "getSightings error: " + error
      if @DEBUG
        w.info "getSightings results: " + result
      if !callback and @DEBUG
        w.info "Warning: getSightings requested without callback"
      else
        callback error, result

  @sighting.getSightingsBySerial = (filterBySerial, callback) ->
    if @DEBUG
      w.info "getSightingsBySerial serial: " + filterBySerial \
      + " (or all if serial is null)"
    filter = {}
    if filterBySerial
      filter = { serial: filterBySerial }
    @find filter, (error, result) =>
      if error and @DEBUG
        w.info "getSightingsBySerial error: " + error
      if @DEBUG
        w.info "getSightingsBySerial results: " + result
      if !callback and @DEBUG
        w.info "Warning: getSightingsBySerial requested without callback"
      else
        callback error, result

  @sighting.getSightingsBySubmitter = (filterBySubmitterId, callback) ->
    if @DEBUG
      w.info "getSightingsBySubmitter id: " + filterBySubmitterId \
      + " (or all if id is null)"
    filter = {}
    if filterBySubmitterId
      filter = { submitterId: filterBySubmitterId }
    @find filter, (error, result) =>
      if error and @DEBUG
        w.info "getSightingsBySubmitter error: " + error
      if @DEBUG
        w.info "getSightingsBySubmitter results: " + result
      if !callback and @DEBUG
        w.info "Warning: getSightingsBySubmitter requested sin callback"
      else
        callback error, result

  @sighting.saveAndCreateBillIfNecessary = (sighting, callback) =>

    sighting.save (err) =>
      if err and @DEBUG
        w.error "Error saving sighting"
      else
        # If there's no existing bill of this sighting, create an entry for it
        @bill.getBillBySerial sighting.serial, (err, result) =>
          if !result
            b = new @bill { serial: sighting.serial, \
              denomination: sighting.denomination, \
              currency: sighting.currency }
            b.save (err) ->
              if callback
                callback err
          else
            # Already record of this bill, do nothing
            if callback
              callback err, result

  @user = mongoose.model 'User', new mongoose.Schema {
    name        : String,
    fbId        : Number
  }

  # TO FIX: These shouldn't be publicly exposed (@ prefix) but the scope
  # of prepopulate's sighting.findOne callback is doing something surprising

  @alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  @getRandomLetter: () =>
    @alphabet[Math.floor(Math.random() * @alphabet.length)]

  @getRandomDigit: () =>
    Math.floor Math.random() * 10

  @getRandomCoordinate: () =>
    (Math.random() * 180) - 90

  @sighting.getRandom = () =>

    # Euro serial is letter followed by 11 digits
    fakeSerial = @getRandomLetter().toUpperCase()
    fakeSerial += @getRandomDigit() for n in [0..10]

    fakeComment = ""
    fakeComment += @getRandomLetter() for n in [0..20]

    new @sighting
      serial: fakeSerial
      latitude: @getRandomCoordinate()
      longitude: @getRandomCoordinate()
      location: "Dummy Location"
      comment: fakeComment