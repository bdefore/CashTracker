module.exports = class Bill

  w = require 'winston'
  model = require '../model'

  # /bills

  @index: (req, res) ->
    model.bill.getBills null, (err, bills) -> res.render bills

  # /bills/:id

  @show: (req, res, next) ->

    w.info "Bill ID: " + req.params.id

    model.sighting.getSightingsBySerial req.params.id, (error, result) =>

      # TO FIX: Poor form. Hijacking the framework here.
      res.render null, { sightings: result }