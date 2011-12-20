module.exports = class DB

  mongoose = require 'mongoose'
  conf = require './conf'

  # Mongodb schema

  Schema = mongoose.Schema

  BillSchema = new Schema {
    serial        : String,
    denomination  : Number,
    currency      : String
  }

  SightingSchema = new Schema {
    serial        : String,
    latitude      : Number,
    longitude     : Number,
    comment       : String,
    submitterId   : String
  }

  mongoose.model 'Bill', BillSchema
  Bill = mongoose.model 'Bill'

  mongoose.model 'Sighting', SightingSchema
  Sighting = mongoose.model 'Sighting'

  @connect: () ->
    mongoose.connect conf.database
    console.log "MongoDB connection success..."

  @prepopulate: () =>

    console.log "Checking for existing data..."

    Sighting.findOne null, (error, result) ->
      if result
        console.log "Found a sighting... skipping dummy data creation..."
      else
        console.log "No sightings found, filling with dummy data..."

        b = new Bill
          serial: 'X18084287225'
          denomination: 20
          currency: 'Euro'
        b.save()

        Bil= l
          serial: 'Y81450250492'
          denomination: 10
          currency: 'Euro'
        b.save()

        s = new Sighting
          serial: 'X18084287225'
          latitude: "41.377301033335414"
          longitude: "2.189307280815329"
          comment: 'I got this from my mother'
        s.save()

        s = new Sighting
          serial: 'Y81450250492'
          latitude: "31.377301033335414"
          longitude: "-32.189307280815329"
          comment: 'I got this from a restaurant'
        s.save()

        s = new Sighting
          serial: 'Y81450250492'
          latitude: "61.377301033335414"
          longitude: "-12.189307280815329"
          comment: 'I got this from my sister'
        s.save()

        s = new Sighting
          serial: 'Y81450250492'
          latitude: "11.377301033335414"
          longitude: "-22.189307280815329"
          comment: 'I got this from Bob'
        s.save()

        console.log "Dummy data created..."