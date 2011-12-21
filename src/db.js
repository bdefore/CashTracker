(function() {
  var DB;

  module.exports = DB = (function() {
    var mongoose, w;

    function DB() {}

    w = require('winston');

    mongoose = require('mongoose');

    DB.Bill = mongoose.model('Bill', new mongoose.Schema({
      serial: String,
      denomination: Number,
      currency: {
        type: String,
        "default": "Euro"
      }
    }));

    DB.Sighting = mongoose.model('Sighting', new mongoose.Schema({
      date: {
        type: Date,
        "default": Date.now
      },
      serial: String,
      latitude: Number,
      longitude: Number,
      comment: String,
      submitterId: String
    }));

    DB.User = mongoose.model('User', new mongoose.Schema({
      name: String,
      fbId: Number
    }));

    DB.debug = true;

    DB.getBills = function(filterBySerial, callback) {
      var filter;
      w.info("getBills serial: " + filterBySerial + " (or all if serial is null)");
      filter = {};
      if (filterBySerial) {
        filter = {
          serial: filterBySerial
        };
      }
      return DB.Bill.find(filter, function(error, result) {
        if (error) w.info("getBills error: " + error);
        w.info("getBills results: " + result);
        if (!callback) {
          return w.info("Warning: getBills requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.getBillBySerial = function(filterBySerial, callback) {
      w.info("getBillBySerial serial: " + filterBySerial);
      return DB.Bill.findOne({
        serial: filterBySerial
      }, function(error, result) {
        if (error) w.info("getBillBySerial error: " + error);
        w.info("getBillBySerial results: " + result);
        if (!callback) {
          return w.info("Warning: getBillBySerial requested without callback");
        } else {
          return callback(error, result);
        }
      });
    };

    DB.getSightings = function(filterById, callback) {
      var filter;
      w.info("getSightings id: " + filterById + " (or all if id is null)");
      filter = {};
      if (filterById) {
        filter = {
          _id: filterById
        };
      }
      return DB.Sighting.find(filter, function(error, result) {
        if (error) w.info("getSightings error: " + error);
        w.info("getSightings results: " + result);
        if (!callback) {
          return w.info("Warning: getSightings requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.getSightingsBySerial = function(filterBySerial, callback) {
      var filter;
      w.info("getSightingsBySerial serial: " + filterBySerial + " (or all if serial is null)");
      filter = {};
      if (filterBySerial) {
        filter = {
          serial: filterBySerial
        };
      }
      return DB.Sighting.find(filter, function(error, result) {
        if (error) w.info("getSightingsBySerial error: " + error);
        w.info("getSightingsBySerial results: " + result);
        if (!callback) {
          return w.info("Warning: getSightingsBySerial requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.getSightingsBySubmitter = function(filterBySubmitterId, callback) {
      var filter;
      w.info("getSightingsBySubmitter id: " + filterBySubmitterId + " (or all if id is null)");
      filter = {};
      if (filterBySubmitterId) {
        filter = {
          submitterId: filterBySubmitterId
        };
      }
      return DB.Sighting.find(filter, function(error, result) {
        if (error) w.info("getSightingsBySubmitter error: " + error);
        w.info("getSightingsBySubmitter results: " + result);
        if (!callback) {
          return w.info("Warning: getSightingsBySubmitter requested sin callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.connect = function(path) {
      mongoose.connect(path);
      return w.info("MongoDB connection success...");
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
      return sighting = new DB.Sighting({
        serial: fakeSerial,
        latitude: DB.getRandomCoordinate(),
        longitude: DB.getRandomCoordinate(),
        comment: fakeComment
      });
    };

    DB.prepopulate = function() {
      w.info("Checking for existing data...");
      return DB.Sighting.findOne(null, function(error, result) {
        var b, n, s;
        if (result) {
          return w.info("Found a sighting... skipping dummy data creation...");
        } else {
          w.info("No sightings found, filling with dummy data...");
          for (n = 0; n <= 10; n++) {
            s = DB.getRandomSighting();
            b = new DB.Bill({
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
