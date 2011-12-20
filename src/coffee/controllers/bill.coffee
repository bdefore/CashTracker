module.exports = class Bill

  DB = require('../db.js')
  Bill = DB.Bill
  Sighting = DB.Sighting

  # /bills
  
  @index: (req, res) ->
    DB.getBills null, res.render

  # /bills/:id

  @show: (req, res, next) ->

    console.log "id: " + req.params.id

    DB.getSightingsBySerial req.params.id, (result) =>

      # TO FIX: Poor form. Hijacking the framework here.
      res.render null, { sightings: result }