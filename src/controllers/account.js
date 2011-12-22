(function() {
  var Account;

  module.exports = Account = (function() {
    var model, w;

    function Account() {}

    w = require('winston');

    model = require('../model');

    Account.index = function(req, res) {
      var _this = this;
      if (!req.user) {
        req.flash('error', "Oi! You're not logged in.");
        return res.redirect('/');
      } else {
        return model.sighting.getSightingsBySubmitter(req.user.id, function(result) {
          var sightings;
          sightings = result;
          return res.render(null, {
            sightings: sightings
          });
        });
      }
    };

    return Account;

  })();

}).call(this);
