(function() {
  var Bill;

  module.exports = Bill = (function() {
    var DB, Sighting;

    function Bill() {}

    DB = require('../db.js');

    Bill = DB.Bill;

    Sighting = DB.Sighting;

    Bill.index = function(req, res) {
      return DB.getBills(null, res.render);
    };

    Bill.show = function(req, res, next) {
      var _this = this;
      console.log("id: " + req.params.id);
      return DB.getSightingsBySerial(req.params.id, function(result) {
        return res.render(null, {
          sightings: result
        });
      });
    };

    return Bill;

  })();

}).call(this);
