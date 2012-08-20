(function() {
  var DB;

  module.exports = DB = (function() {
    var model, mongoose, w;

    function DB() {}

    w = require('winston');

    mongoose = require('mongoose');

    model = require('./model');

    DB.connect = function(path, callback) {
      mongoose.connect(path, function(err, success) {
        if (err) {
          w.error(err);
        } else {
          w.info("MongoDB connection success");
        }
        if (callback) return callback(err, success);
      });
      return null;
    };

    DB.disconnect = function(callback) {
      return mongoose.disconnect(callback);
    };

    DB.prepopulate = function() {
      w.info("Checking for existing data...");
      return model.sighting.findOne(null, function(error, result) {
        var b, n, s;
        if (result) {
          return w.info("Found a sighting... skipping dummy data creation...");
        } else {
          w.info("No sightings found, filling with dummy data...");
          for (n = 0; n <= 10; n++) {
            s = model.sighting.getRandom();
            b = new model.bill({
              serial: s.serial,
              denomination: 20,
              currency: 'Euro'
            });
            b.save(function(err) {
              if (err) return w.error("Failed to create dummy bill: " + err);
            });
            s.save(function(err) {
              if (err) return w.error("Failed to create dummy sighting: " + err);
            });
            w.info('Adding dummy sighting: ' + s);
          }
          return w.info("Dummy data created...");
        }
      });
    };

    return DB;

  }).call(this);

}).call(this);
