(function() {
  var Sighting;

  module.exports = Sighting = (function() {
    var model, w;

    function Sighting() {}

    w = require('winston');

    model = require('../model');

    Sighting.index = function(req, res) {
      return model.sighting.getSightings(null, function(err, sightings) {
        return res.render(sightings);
      });
    };

    Sighting.add = function(req, res, next) {
      var bill, sighting;
      bill = new model.bill({
        serial: "",
        currency: "Euro",
        denomination: 10
      });
      sighting = new model.sighting({
        serial: bill.serial,
        location: "",
        latitude: "",
        longitude: "",
        comment: ""
      });
      return res.render(sighting, {
        bill: bill
      });
    };

    Sighting.show = function(req, res, next) {
      var _this = this;
      if (req.params.id) {
        return model.sighting.findById(req.params.id, function(err, result) {
          if (result) {
            return model.bill.getBillBySerial(result.serial, function(error, bill) {
              return res.render(result, {
                bill: bill
              });
            });
          } else {
            req.flash('error', 'Could not find sighting details for id: ' + req.params.id);
            return res.redirect('/sightings');
          }
        });
      } else {
        req.flash('error', 'Could not find sighting details for id: ' + req.params.id);
        return res.redirect('/sightings');
      }
    };

    Sighting.edit = function(req, res, next) {
      var _this = this;
      if (req.params.id) {
        return model.sighting.findById(req.params.id, function(err, result) {
          if (result) {
            return model.bill.getBillBySerial(result.serial, function(error, bill) {
              return res.render(result, {
                bill: bill
              });
            });
          } else {
            req.flash('error', 'Could not find sighting details for id: ' + req.params.id);
            return res.redirect('/sightings/add');
          }
        });
      } else {
        req.flash('error', 'Could not find sighting details for id: ' + req.params.id);
        return res.redirect('/sightings/add');
      }
    };

    Sighting.update = function(req, res, next) {
      var sighting,
        _this = this;
      sighting = new model.sighting(req.body.sighting);
      sighting.denomination = Number(req.body.sighting.denomination);
      if (sighting.serial.length !== 12) {
        req.flash('info', 'Serial must contain 12 characters, the first beginning with a letter');
        return res.redirect('/sightings/add');
      } else {
        if (req.user) sighting.submitterId = req.user.id;
        return model.sighting.findById(sighting.id, function(error, result) {
          var updateCallback;
          if (result) {
            w.info("Updating existing entry");
            updateCallback = function(error) {
              if (error) {
                w.info("Error updating entry: " + error);
                req.flash('error', 'Failed to update entry: ' + error);
                return res.redirect('/sightings');
              } else {
                w.info("=== Successful update === ");
                req.flash('success', 'Successfully updated entry.');
                return res.redirect('/sightings');
              }
            };
            return model.sighting.update({
              _id: sighting._id
            }, {
              serial: sighting.serial,
              comment: sighting.comment
            }, null, updateCallback);
          } else {
            w.info("Saving new entry: '" + sighting + "'");
            return model.sighting.saveAndCreateBillIfNecessary(sighting, function(err, result) {
              if (err) {
                w.info("Creation of new sighting or related bill failed.");
                req.flash('error', 'Failed to save sighting.');
                return res.redirect('/sightings');
              } else {
                w.info("New bill creation success");
                req.flash('success', 'Successfully saved sighting.');
                return res.redirect('/sightings');
              }
            });
          }
        });
      }
    };

    return Sighting;

  })();

}).call(this);
