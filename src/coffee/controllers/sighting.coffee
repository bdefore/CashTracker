module.exports = class Account

  DB = require '../db.js'
  Bill = DB.Bill
  Sighting = DB.Sighting
  conf = require '../conf'
  everyauth = require 'everyauth'
  # /sightings
  
  @index: (req, res) ->
    DB.getSightings null, res.render

  # /sightings/add

  @add: (req, res, next) ->
    # TO FIX: Blank object construction shouldn't be necessary. Validate forms instead.
    # TO FIX: Default to 10?
    bill = new Bill { serial: "", currency: "Euro", denomination: 10 }
    sighting = new Sighting { serial: bill.serial, latitude: "", longitude: "", comment: "" }

    res.render sighting, { bill: bill }

  # /sightings/:id

  @show: (req, res, next) ->
    DB.getSightings req.params.id, (result) =>
      # TO FIX: Periodic server crashes when result appears to be null
      if result && result[0]
        DB.getBillBySerial result[0].serial, (error, bill) =>
          res.render result[0], { bill: bill }
      else
        # TO FIX: Better than pass empty object? Inform user of error?
        res.render [], { bill: {} }

  # /sightings/:id/edit
  
  @edit: (req, res, next) ->
    if req.params.id
      DB.getSightings req.params.id, (result) =>
        if result && result[0]
          DB.getBillBySerial result[0].serial, (error, bill) =>
            res.render result[0], { bill: bill }
        else
          res.redirect '/sightings/add'
    else
      res.redirect '/sightings/add'

  # PUT /sightings/:id
  
  @update: (req, res, next) ->
    sighting = new Sighting req.body.sighting

    # Validate
    # Euro example: X18084287225
    # USD example: CE24659434D (E5 underneath that) on a 20
    if sighting.serial.length != 12
      req.flash 'info', 'Serial must contain 12 characters, the first beginning with a letter'
      res.redirect '/sightings/add'
    else
      # If user is logged in, tag their id to this submission
      if req.user
        sighting.submitterId = req.user.id;

      Sighting.findById sighting.id, (error, result) =>
        if result
          console.log "Updating existing entry"

          Sighting.update \
            { _id: sighting._id }, \
            { serial: sighting.serial, latitude: sighting.latitude, longitude: sighting.longitude, comment: sighting.comment }, \
            null, \
            (error) =>
              if error
                console.log "Error updating entry: " + error
                req.flash 'error', 'Failed to update entry.'
                res.redirect '/sightings'
              else
                console.log "=== Successful update === "
                req.flash 'success', 'Successfully updated entry.'
                res.redirect '/sightings'
        else
          # New sighting, save new entry
          console.log "Saving new entry: '" + result + "'"
          sighting.save()

          # If there's no existing bill of this sighting, create an entry for it
          DB.getBillBySerial sighting.serial, (error, result) =>
            if !result
              b = new Bill { serial: sighting.serial, denomination: sighting.denomination, currency: sighting.currency }
              b.save()
              console.log "saved new sighting to new record"
              req.flash 'success', 'Successfully saved sighting. First record of this bill!'
              res.redirect '/sightings'
            else
              console.log "saved new sighting to preexisting record: " + result
              req.flash 'success', 'Successfully saved sighting. Bill has been seen before!'
              res.redirect '/sightings'