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

    DB.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    DB.getRandomLetter = function() {
      return DB.alphabet[Math.floor(Math.random() * DB.alphabet.length)];
    };

    DB.getRandomDigit = function() {
      return Math.floor(Math.random() * 10);
    };

    DB.getRandomCoordinate = function() {
      return (Math.random() * 180) - 90;
    };

    DB.getRandomSighting = function() {
      var fakeComment, fakeSerial, n, sighting;
      fakeSerial = DB.getRandomLetter().toUpperCase();
      for (n = 0; n <= 10; n++) {
        fakeSerial += DB.getRandomDigit();
      }
      fakeComment = "";
      for (n = 0; n <= 20; n++) {
        fakeComment += DB.getRandomLetter();
      }
      return sighting = new model.sighting({
        serial: fakeSerial,
        latitude: DB.getRandomCoordinate(),
        longitude: DB.getRandomCoordinate(),
        location: "Dummy Location",
        comment: fakeComment
      });
    };

    DB.prepopulate = function() {
      w.info("Checking for existing data...");
      return model.sighting.findOne(null, function(error, result) {
        var b, n, s;
        if (result) {
          w.info("result: " + result);
          return w.info("Found a sighting... skipping dummy data creation...");
        } else {
          w.info("No sightings found, filling with dummy data...");
          for (n = 0; n <= 10; n++) {
            s = DB.getRandomSighting();
            b = new model.bill({
              serial: s.serial,
              denomination: 20,
              currency: 'Euro'
            });
            b.save();
            s.save();
            w.info('Adding dummy sighting: ' + s);
          }
          return w.info("Dummy data created...");
        }
      });
    };

    return DB;

  }).call(this);

}).call(this);
