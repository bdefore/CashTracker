(function() {
  var Bill;

  module.exports = Bill = (function() {
    var model, w;

    function Bill() {}

    w = require('winston');

    model = require('../model');

    Bill.index = function(req, res) {
      return model.bill.getBills(null, function(err, bills) {
        return res.render(bills);
      });
    };

    Bill.show = function(req, res, next) {
      var _this = this;
      w.info("Bill ID: " + req.params.id);
      return model.sighting.getSightingsBySerial(req.params.id, function(error, result) {
        return res.render(null, {
          sightings: result
        });
      });
    };

    return Bill;

  })();

}).call(this);
