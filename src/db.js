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
      currency: String
    }));

    DB.Sighting = mongoose.model('Sighting', new mongoose.Schema({
      date: Date,
      serial: String,
      latitude: Number,
      longitude: Number,
      comment: String,
      submitterId: String
    }));

    DB.getBills = function(filterBySerial, callback) {
      var filter;
      console.log("getting bill by serial: " + filterBySerial + " (or all if serial is null)");
      filter = {};
      if (filterBySerial) {
        filter = {
          serial: filterBySerial
        };
      }
      return DB.Bill.find(filter, function(error, result) {
        if (error) console.log("Error getting bills: " + error);
        console.log("results: " + result);
        if (!callback) {
          return console.log("Warning: bills requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.getBillBySerial = function(filterBySerial, callback) {
      console.log("getting bill of serial: " + filterBySerial);
      return DB.Bill.findOne({
        serial: filterBySerial
      }, function(error, result) {
        if (error) console.log("Error getting bills: " + error);
        console.log("bill results: " + result);
        if (!callback) {
          return console.log("Warning: bills requested without callback");
        } else {
          return callback(error, result);
        }
      });
    };

    DB.getSightings = function(filterById, callback) {
      var filter;
      console.log("getting sighting of id: " + filterById + " (or all if id is null)");
      filter = {};
      if (filterById) {
        filter = {
          _id: filterById
        };
      }
      return DB.Sighting.find(filter, function(error, result) {
        if (error) console.log("Error getting sightings: " + error);
        console.log("results: " + result);
        if (!callback) {
          return console.log("Warning: sightings requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.getSightingsBySerial = function(filterBySerial, callback) {
      var filter;
      console.log("getting sighting of serial: " + filterBySerial + " (or all if serial is null)");
      filter = {};
      if (filterBySerial) {
        filter = {
          serial: filterBySerial
        };
      }
      return DB.Sighting.find(filter, function(error, result) {
        if (error) console.log("Error getting sightings: " + error);
        console.log("results: " + result);
        if (!callback) {
          return console.log("Warning: sightings requested without callback");
        } else {
          return callback(result);
        }
      });
    };

    DB.getSightingsBySubmitter = function(filterBySubmitterId, callback) {
      var filter;
      console.log("getting sighting of id: " + filterBySubmitterId + " (or all if id is null)");
      filter = {};
      if (filterBySubmitterId) {
        filter = {
          submitterId: filterBySubmitterId
        };
      }
      return DB.Sighting.find(filter, function(error, result) {
        if (error) console.log("Error getting sightings: " + error);
        console.log("results: " + result);
        if (!callback) {
          return console.log("Warning: sightings requested without callback");
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
        date: new Date(),
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
          for (n = 0; n <= 20; n++) {
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
