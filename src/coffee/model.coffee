module.exports = class Model

  @DEBUG = false

  mongoose = require 'mongoose'

  # TO FIX: How to split these into their own classes via CoffeeScript?

  @bill = mongoose.model 'Bill' , new mongoose.Schema {
    # _id           : String, # assigned by mongodb
    serial        : String,
    denomination  : Number,
    currency      : { type: String, default: "Euro" }
  }

  @bill.getBillBySerial = (filterBySerial, callback) ->
    if @DEBUG
      w.info "getBillBySerial serial: " + filterBySerial
    @findOne { serial: filterBySerial }, (error, result) =>
      if error
        if @DEBUG
          w.info "getBillBySerial error: " + error
      if @DEBUG
          w.info "getBillBySerial results: " + result
      if !callback
        if @DEBUG
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
      if error
        if @DEBUG
          w.info "getBills error: " + error
      if @DEBUG
        w.info "getBills results: " + result
      if !callback
        if @DEBUG
          w.info "Warning: getBills requested without callback"
      else
        callback result

  @sighting = mongoose.model 'Sighting', new mongoose.Schema {
    # _id           : String, # assigned by mongodb
    date          : { type: Date, default: Date.now }
    serial        : String,
    latitude      : Number,
    longitude     : Number,
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
      if error
        if @DEBUG
          w.info "getSightings error: " + error
      if @DEBUG
          w.info "getSightings results: " + result
      if !callback
        if @DEBUG
          w.info "Warning: getSightings requested without callback"
      else
        callback result

  @sighting.getSightingsBySerial = (filterBySerial, callback) ->
    if @DEBUG
      w.info "getSightingsBySerial serial: " + filterBySerial \
      + " (or all if serial is null)"
    filter = {}
    if filterBySerial
      filter = { serial: filterBySerial }
    @find filter, (error, result) =>
      if error
        if @DEBUG
          w.info "getSightingsBySerial error: " + error
      if @DEBUG
        w.info "getSightingsBySerial results: " + result
      if !callback
        if @DEBUG
          w.info "Warning: getSightingsBySerial requested without callback"
      else
        callback result

  @sighting.getSightingsBySubmitter = (filterBySubmitterId, callback) ->
    if @DEBUG
      w.info "getSightingsBySubmitter id: " + filterBySubmitterId \
      + " (or all if id is null)"
    filter = {}
    if filterBySubmitterId
      filter = { submitterId: filterBySubmitterId }
    @find filter, (error, result) =>
      if error
        if @DEBUG
          w.info "getSightingsBySubmitter error: " + error
      if @DEBUG
        w.info "getSightingsBySubmitter results: " + result
      if !callback
        if @DEBUG
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

  @user = mongoose.model 'User', new mongoose.Schema {
    name        : String,
    fbId        : Number
  }