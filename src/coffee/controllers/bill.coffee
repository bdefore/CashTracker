module.exports = class Bill

  w = require 'winston'
  model = require '../model'

  # /bills

  @index: (req, res) ->
    model.bill.getBills null, res.render

  # /bills/:id

  @show: (req, res, next) ->

    w.info "Bill ID: " + req.params.id

    model.sighting.getSightingsBySerial req.params.id, (result) =>

      # TO FIX: Poor form. Hijacking the framework here.
      res.render null, { sightings: result }