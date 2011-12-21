(function() {
  var Account;

  module.exports = Account = (function() {
    var Bill, DB, Sighting, w;

    function Account() {}

    w = require('winston');

    DB = require('../db.js');

    Bill = DB.Bill;

    Sighting = DB.Sighting;

    Account.index = function(req, res) {
      var _this = this;
      if (!req.user) {
        req.flash('error', "Oi! You're not logged in.");
        return res.redirect('/');
      } else {
        return DB.getSightingsBySubmitter(req.user.id, function(result) {
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
