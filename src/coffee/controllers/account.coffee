module.exports = class Account

  DB = require('../db.js')
  Bill = DB.Bill
  Sighting = DB.Sighting

  @index: (req, res) ->

    if !req.user
      req.flash 'error', "Oi! You're not logged in."
      res.redirect '/'
    else
      DB.getSightingsBySubmitter req.user.id, (result) =>
        sightings = result

        res.render null, { sightings: sightings }

        # Related bills no longer being displayed. Not very useful.
        # The following logic was functional, to display it:

        # TO FIX: We keep track of how many sightings have been matched
        # to bills this way, and don't render the page until n DB requests
        # have been made for each of them. Feels very caveman and needs to
        # have a better solution to scale. Perhaps storing this information
        # to a table specific to user is better.

        # relatedBills = []
        # totalToCheck = result.length
        # currentCheck = 0

        # if sightings.length > 0
        #   for sighting in sightings
        #     console.log "sighting: " + sighting

        #     DB.getBillBySerial sighting.serial, (error, bill) =>
        #       relatedBills.push bill
        #       currentCheck++

        #       console.log 'Related bill received: ' + bill.serial + \
        #         " lookup: " + currentCheck + " of " + totalToCheck

        #       if currentCheck == totalToCheck
        #          res.render null, { sightings: sightings, bills: \
        #           relatedBills }
        # else
        #   # User has not entered any sightings, would not otherwise get to
        #   # render step
        #   res.render null, { sightings: sightings, bills: relatedBills }