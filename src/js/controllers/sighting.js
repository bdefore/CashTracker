(function() {
  var Account;

  module.exports = Account = (function() {
    var model, w;

    function Account() {}

    w = require('winston');

    model = require('../model');

    Account.index = function(req, res) {
      return model.sighting.getSightings(null, res.render);
    };

    Account.add = function(req, res, next) {
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

    Account.show = function(req, res, next) {
      var _this = this;
      return model.sighting.getSightings(req.params.id, function(result) {
        if (result && result[0]) {
          return model.bill.getBillBySerial(result[0].serial, function(error, bill) {
            return res.render(result[0], {
              bill: bill
            });
          });
        } else {
          return res.render([], {
            bill: {}
          });
        }
      });
    };

    Account.edit = function(req, res, next) {
      var _this = this;
      if (req.params.id) {
        return model.sighting.getSightings(req.params.id, function(result) {
          if (result && result[0]) {
            return model.bill.getBillBySerial(result[0].serial, function(error, bill) {
              return res.render(result[0], {
                bill: bill
              });
            });
          } else {
            return res.redirect('/sightings/add');
          }
        });
      } else {
        return res.redirect('/sightings/add');
      }
    };

    Account.update = function(req, res, next) {
      var sighting,
        _this = this;
      sighting = new model.sighting(req.body.sighting);
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
            sighting.save();
            return model.bill.getBillBySerial(sighting.serial, function(error, result) {
              var b;
              if (!result) {
                w.info('new bill denom: ' + sighting.serial + " : " + sighting.denomination);
                b = new model.bill({
                  serial: sighting.serial,
                  denomination: Number(req.body.sighting.denomination),
                  currency: sighting.currency
                });
                return b.save(function(err) {
                  if (err) {
                    return w.info("Creation of new Bill entry failed.");
                  } else {
                    w.info("New bill creation success");
                    req.flash('success', 'Successfully saved sighting. First record of this bill!');
                    return res.redirect('/sightings');
                  }
                });
              } else {
                w.info("saved new sighting to preexisting record: " + result);
                req.flash('success', 'Successfully saved sighting. Bill has been seen before!');
                return res.redirect('/sightings');
              }
            });
          }
        });
      }
    };

    return Account;

  })();

}).call(this);
