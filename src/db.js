(function() {
  var DB;

  module.exports = DB = (function() {
    var conf, mongoose;

    function DB() {}

    mongoose = require('mongoose');

    conf = require('./conf');

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

    DB.debug = true;

    DB.getBills = function(filterBySerial, callback) {
      var filter;
      console.log("getBills serial: " + filterBySerial + " (or all if serial is null)");
      filter = {};
      if (filterBySerial) {
        filter = {
          serial: filterBySerial
        };
      }
      return DB.Bill.find(filter, function(error, result) {
        if (error) console.log("getBills error: " + error);
        console.log("getBills results: " + result);
        if (!callback) {
          return console.log("Warning: getBills requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.getBillBySerial = function(filterBySerial, callback) {
      console.log("getBillBySerial serial: " + filterBySerial);
      return DB.Bill.findOne({
        serial: filterBySerial
      }, function(error, result) {
        if (error) console.log("getBillBySerial error: " + error);
        console.log("getBillBySerial results: " + result);
        if (!callback) {
          return console.log("Warning: getBillBySerial requested without callback");
        } else {
          return callback(error, result);
        }
      });
    };

    DB.getSightings = function(filterById, callback) {
      var filter;
      console.log("getSightings id: " + filterById + " (or all if id is null)");
      filter = {};
      if (filterById) {
        filter = {
          _id: filterById
        };
      }
      return DB.Sighting.find(filter, function(error, result) {
        if (error) console.log("getSightings error: " + error);
        console.log("getSightings results: " + result);
        if (!callback) {
          return console.log("Warning: getSightings requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.getSightingsBySerial = function(filterBySerial, callback) {
      var filter;
      console.log("getSightingsBySerial serial: " + filterBySerial + " (or all if serial is null)");
      filter = {};
      if (filterBySerial) {
        filter = {
          serial: filterBySerial
        };
      }
      return DB.Sighting.find(filter, function(error, result) {
        if (error) console.log("getSightingsBySerial error: " + error);
        console.log("getSightingsBySerial results: " + result);
        if (!callback) {
          return console.log("Warning: getSightingsBySerial requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.getSightingsBySubmitter = function(filterBySubmitterId, callback) {
      var filter;
      console.log("getSightingsBySubmitter id: " + filterBySubmitterId + " (or all if id is null)");
      filter = {};
      if (filterBySubmitterId) {
        filter = {
          submitterId: filterBySubmitterId
        };
      }
      return DB.Sighting.find(filter, function(error, result) {
        if (error) console.log("getSightingsBySubmitter error: " + error);
        console.log("getSightingsBySubmitter results: " + result);
        if (!callback) {
          return console.log("Warning: getSightingsBySubmitter requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.connect = function() {
      mongoose.connect(conf.database);
      return console.log("MongoDB connection success...");
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
      console.log("Checking for existing data...");
      return DB.Sighting.findOne(null, function(error, result) {
        var b, n, s;
        if (result) {
          return console.log("Found a sighting... skipping dummy data creation...");
        } else {
          console.log("No sightings found, filling with dummy data...");
          for (n = 0; n <= 10; n++) {
            s = DB.getRandomSighting();
            b = new DB.Bill({
              serial: s.serial,
              denomination: 20,
              currency: 'Euro'
            });
            b.save();
            s.save();
            console.log('Adding dummy sighting: ' + s);
          }
          return console.log("Dummy data created...");
        }
      });
    };

    return DB;

  }).call(this);

}).call(this);
