(function() {
  var Account;

  module.exports = Account = (function() {
    var Bill, DB, Sighting;

    function Account() {}

    DB = require('../db.js');

    Bill = DB.Bill;

    Sighting = DB.Sighting;

    Account.index = function(req, res) {
      var _this = this;
      return DB.getSightingsBySubmitter(req.user.id, function(result) {
        var currentCheck, relatedBills, sighting, sightings, totalToCheck, _i, _len, _results;
        relatedBills = [];
        sightings = result;
        totalToCheck = result.length;
        currentCheck = 0;
        if (sightings.length > 0) {
          _results = [];
          for (_i = 0, _len = sightings.length; _i < _len; _i++) {
            sighting = sightings[_i];
            console.log("sighting: " + sighting);
            _results.push(DB.getBillBySerial(sighting.serial, function(error, bill) {
              relatedBills.push(bill);
              currentCheck++;
              console.log('Related bill received: ' + bill.serial + " lookup: " + currentCheck + " of " + totalToCheck);
              if (currentCheck === totalToCheck) {
                return res.render(null, {
                  sightings: sightings,
                  bills: relatedBills
                });
              }
            }));
          }
          return _results;
        } else {
          return res.render(null, {
            sightings: sightings,
            bills: relatedBills
          });
        }
      });
    };

    return Account;

  })();

}).call(this);
