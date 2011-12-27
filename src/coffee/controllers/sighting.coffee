module.exports = class Sighting

  w = require 'winston'
  model = require '../model'

  # /sightings

  @index: (req, res) ->
    model.sighting.getSightings null, res.render

  # /sightings/add

  @add: (req, res, next) ->
    # TO FIX: Blank object construction shouldn't be necessary.
    # Validate forms instead.

    # TO FIX: Default to 10?
    bill = new model.bill { serial: "", currency: "Euro", denomination: 10 }
    sighting = new model.sighting \
      { serial: bill.serial, location: "", latitude: "", longitude: "", comment: "" }

    res.render sighting, { bill: bill }

  # /sightings/:id

  @show: (req, res, next) ->
    if req.params.id
      model.sighting.findById req.params.id, (err, result) =>
        if result
          model.bill.getBillBySerial result.serial, (error, bill) =>
            res.render result, { bill: bill }
        else
          req.flash 'error', 'Could not find sighting details for id: ' + req.params.id
          res.redirect '/sightings'
    else
      req.flash 'error', 'Could not find sighting details for id: ' + req.params.id
      res.redirect '/sightings'

  # /sightings/:id/edit

  @edit: (req, res, next) ->
    if req.params.id
      model.sighting.findById req.params.id, (err, result) =>
        if result
          model.bill.getBillBySerial result.serial, (error, bill) =>
            res.render result, { bill: bill }
        else
          req.flash 'error', 'Could not find sighting details for id: ' + req.params.id
          res.redirect '/sightings/add'
    else
      req.flash 'error', 'Could not find sighting details for id: ' + req.params.id
      res.redirect '/sightings/add'

  # PUT /sightings/:id

  @update: (req, res, next) ->
    sighting = new model.sighting req.body.sighting

    # Validate
    # Euro example: X18084287225
    # USD example: CE24659434D (E5 underneath that) on a 20
    if sighting.serial.length != 12
      req.flash 'info', \
        'Serial must contain 12 characters, the first beginning with a letter'
      res.redirect '/sightings/add'
    else
      # If user is logged in, tag their id to this submission
      if req.user
        sighting.submitterId = req.user.id

      model.sighting.findById sighting.id, (error, result) =>
        if result
          w.info "Updating existing entry"

          updateCallback = (error) =>
            if error
              w.info "Error updating entry: " + error
              req.flash 'error', 'Failed to update entry: ' + error
              res.redirect '/sightings'
            else
              w.info "=== Successful update === "
              req.flash 'success', 'Successfully updated entry.'
              res.redirect '/sightings'

          model.sighting.update \
            { _id: sighting._id }, \
            { serial: sighting.serial, \
              comment: sighting.comment }, \
            null, \
            updateCallback
        else
          # New sighting, save new entry
          w.info "Saving new entry: '" + sighting + "'"
          sighting.save()

          # If there's no existing bill of this sighting, create an entry for it
          model.bill.getBillBySerial sighting.serial, (error, result) ->
            if !result
              w.info 'new bill denom: ' + sighting.serial + " : " + sighting.denomination

              b = new model.bill { serial: sighting.serial, \
                denomination: Number(req.body.sighting.denomination), \
                currency: sighting.currency }
              b.save (err) ->
                if err
                  w.info "Creation of new Bill entry failed."
                else
                  w.info "New bill creation success"
                  req.flash 'success', \
                    'Successfully saved sighting. First record of this bill!'
                  res.redirect '/sightings'
            else
              w.info "saved new sighting to preexisting record: " + result
              req.flash 'success', \
                'Successfully saved sighting. Bill has been seen before!'
              res.redirect '/sightings'