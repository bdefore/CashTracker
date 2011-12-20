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

    DB.prepopulate = function() {
      console.log("Checking for existing data...");
      return DB.Sighting.findOne(null, function(error, result) {
        var b, s;
        if (result) {
          return console.log("Found a sighting... skipping dummy data creation...");
        } else {
          console.log("No sightings found, filling with dummy data...");
          b = new DB.Bill({
            serial: 'X18084287225',
            denomination: 20,
            currency: 'Euro'
          });
          b.save();
          b = new DB.Bill({
            serial: 'Y81450250492',
            denomination: 10,
            currency: 'Euro'
          });
          b.save();
          s = new DB.Sighting({
            serial: 'X18084287225',
            latitude: "41.377301033335414",
            longitude: "2.189307280815329",
            comment: 'I got this from my mother'
          });
          s.save();
          s = new DB.Sighting({
            serial: 'Y81450250492',
            latitude: "31.377301033335414",
            longitude: "-32.189307280815329",
            comment: 'I got this from a restaurant'
          });
          s.save();
          s = new DB.Sighting({
            serial: 'Y81450250492',
            latitude: "61.377301033335414",
            longitude: "-12.189307280815329",
            comment: 'I got this from my sister'
          });
          s.save();
          s = new DB.Sighting({
            serial: 'Y81450250492',
            latitude: "11.377301033335414",
            longitude: "-22.189307280815329",
            comment: 'I got this from Bob'
          });
          s.save();
          return console.log("Dummy data created...");
        }
      });
    };

    return DB;

  }).call(this);

}).call(this);
