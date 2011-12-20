(function() {
  var Account;

  module.exports = Account = (function() {
    var Bill, DB, Sighting, conf, everyauth;

    function Account() {}

    DB = require('../db.js');

    Bill = DB.Bill;

    Sighting = DB.Sighting;

    conf = require('../conf');

    everyauth = require('everyauth');

    Account.index = function(req, res) {
      return DB.getSightings(null, res.render);
    };

    Account.add = function(req, res, next) {
      var bill, sighting;
      bill = new Bill({
        serial: "",
        currency: "Euro",
        denomination: 10
      });
      sighting = new Sighting({
        serial: bill.serial,
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
      return DB.getSightings(req.params.id, function(result) {
        if (result && result[0]) {
          return DB.getBillBySerial(result[0].serial, function(error, bill) {
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
        return DB.getSightings(req.params.id, function(result) {
          if (result && result[0]) {
            return DB.getBillBySerial(result[0].serial, function(error, bill) {
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
      sighting = new Sighting(req.body.sighting);
      if (sighting.serial.length !== 12) {
        req.flash('info', 'Serial must contain 12 characters, the first beginning with a letter');
        return res.redirect('/sightings/add');
      } else {
        if (req.user) sighting.submitterId = req.user.id;
        return Sighting.findById(sighting.id, function(error, result) {
          if (result) {
            console.log("Updating existing entry");
            return Sighting.update({
              _id: sighting._id
            }, {
              serial: sighting.serial,
              latitude: sighting.latitude,
              longitude: sighting.longitude,
              comment: sighting.comment
            }, null, function(error) {
              if (error) {
                console.log("Error updating entry: " + error);
                req.flash('error', 'Failed to update entry.');
                return res.redirect('/sightings');
              } else {
                console.log("=== Successful update === ");
                req.flash('success', 'Successfully updated entry.');
                return res.redirect('/sightings');
              }
            });
          } else {
            console.log("Saving new entry: '" + result + "'");
            sighting.save();
            return DB.getBillBySerial(sighting.serial, function(error, result) {
              var b;
              if (!result) {
                b = new Bill({
                  serial: sighting.serial,
                  denomination: sighting.denomination,
                  currency: sighting.currency
                });
                b.save();
                console.log("saved new sighting to new record");
                req.flash('success', 'Successfully saved sighting. First record of this bill!');
                return res.redirect('/sightings');
              } else {
                console.log("saved new sighting to preexisting record: " + result);
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
