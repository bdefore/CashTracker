module.exports = class DB

  mongoose = require 'mongoose'
  conf = require './conf'

  # Mongodb schema

  @Bill = mongoose.model 'Bill' , new mongoose.Schema {
    serial        : String,
    denomination  : Number,
    currency      : String
  }

  @Sighting = mongoose.model 'Sighting', new mongoose.Schema {
    serial        : String,
    latitude      : Number,
    longitude     : Number,
    comment       : String,
    submitterId   : String
  }

  # ===================
  # Begin service logic
  # ===================

  @getBills: (filterBySerial, callback) =>
    console.log "getting bill by serial: " + filterBySerial + " (or all if serial is null)"
    filter = {}
    if filterBySerial
      filter = { serial: filterBySerial }
    @Bill.find filter, (error, result) =>
      if error
        console.log "Error getting bills: " + error
      console.log "results: " + result
      if !callback
        console.log "Warning: bills requested without callback"
      else
        callback result

  @getBillBySerial: (filterBySerial, callback) =>
    console.log "getting bill of serial: " + filterBySerial
    @Bill.findOne { serial: filterBySerial }, (error, result) =>
      if error
        console.log "Error getting bills: " + error
      console.log "bill results: " + result
      if !callback
        console.log "Warning: bills requested without callback"
      else
        callback error, result

  @getSightings: (filterById, callback) =>
    console.log "getting sighting of id: " + filterById + " (or all if id is null)"
    filter = {}
    if filterById
      filter = { _id: filterById }
    @Sighting.find filter, (error, result) =>
      if error
        console.log "Error getting sightings: " + error
      console.log "results: " + result
      if !callback
        console.log "Warning: sightings requested without callback"
      else
        callback result

  @getSightingsBySerial: (filterBySerial, callback) =>
    console.log "getting sighting of serial: " + filterBySerial + " (or all if serial is null)"
    filter = {}
    if filterBySerial
      filter = { serial: filterBySerial }
    @Sighting.find filter, (error, result) =>
      if error
        console.log "Error getting sightings: " + error
      console.log "results: " + result
      if !callback
        console.log "Warning: sightings requested without callback"
      else
        callback result

  @getSightingsBySubmitter: (filterBySubmitterId, callback) =>
    console.log "getting sighting of id: " + filterBySubmitterId + " (or all if id is null)"
    filter = {}
    if filterBySubmitterId
      filter = { submitterId: filterBySubmitterId }
    @Sighting.find filter, (error, result) =>
      if error
        console.log "Error getting sightings: " + error
      console.log "results: " + result
      if !callback
        console.log "Warning: sightings requested without callback"
      else
        callback result

  # No longer used?
  # 
  # function getUser(id, callback) {
  #   console.log("getting user of id: " + id)
  #   User.findOne( { id: id }, function(error, result) {
  #     if(error) console.log("Error getting user: " + error);
  #     console.log("results: " + result)
  #     if(!callback) console.log("Warning: sightings requested without callback")
  #     else callback(result);
  #   });
  # }

  # ===================
  # End service logic
  # ===================

  @connect: () =>
    mongoose.connect conf.database
    console.log "MongoDB connection success..."

  @prepopulate: () =>

    console.log "Checking for existing data..."

    @Sighting.findOne null, (error, result) =>
      if result
        console.log "Found a sighting... skipping dummy data creation..."
      else
        console.log "No sightings found, filling with dummy data..."

        b = new @Bill
          serial: 'X18084287225'
          denomination: 20
          currency: 'Euro'
        b.save()

        b = new @Bill
          serial: 'Y81450250492'
          denomination: 10
          currency: 'Euro'
        b.save()

        s = new @Sighting
          serial: 'X18084287225'
          latitude: "41.377301033335414"
          longitude: "2.189307280815329"
          comment: 'I got this from my mother'
        s.save()

        s = new @Sighting
          serial: 'Y81450250492'
          latitude: "31.377301033335414"
          longitude: "-32.189307280815329"
          comment: 'I got this from a restaurant'
        s.save()

        s = new @Sighting
          serial: 'Y81450250492'
          latitude: "61.377301033335414"
          longitude: "-12.189307280815329"
          comment: 'I got this from my sister'
        s.save()

        s = new @Sighting
          serial: 'Y81450250492'
          latitude: "11.377301033335414"
          longitude: "-22.189307280815329"
          comment: 'I got this from Bob'
        s.save()

        console.log "Dummy data created..."