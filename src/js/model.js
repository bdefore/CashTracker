(function() {
  var Model;

  module.exports = Model = (function() {
    var mongoose, w,
      _this = this;

    function Model() {}

    Model.DEBUG = false;

    w = require('winston');

    mongoose = require('mongoose');

    Model.bill = mongoose.model('Bill', new mongoose.Schema({
      serial: String,
      denomination: {
        type: Number,
        "default": 10
      },
      currency: {
        type: String,
        "default": "Euro"
      }
    }));

    Model.bill.getBillBySerial = function(filterBySerial, callback) {
      var _this = this;
      if (this.DEBUG) w.info("getBillBySerial serial: " + filterBySerial);
      return this.findOne({
        serial: filterBySerial
      }, function(error, result) {
        if (error && _this.DEBUG) w.info("getBillBySerial error: " + error);
        if (_this.DEBUG) w.info("getBillBySerial results: " + result);
        if (!callback && _this.DEBUG) {
          return w.info("Warning: getBillBySerial requested without callback");
        } else {
          return callback(error, result);
        }
      });
    };

    Model.bill.getBills = function(filterBySerial, callback) {
      var filter,
        _this = this;
      if (this.DEBUG) {
        w.info("getBills serial: " + filterBySerial + " (or all if serial is null)");
      }
      filter = {};
      if (filterBySerial) {
        filter = {
          serial: filterBySerial
        };
      }
      return this.find(filter, function(error, result) {
        if (error && _this.DEBUG) w.info("getBills error: " + error);
        if (_this.DEBUG) w.info("getBills results: " + result);
        if (!callback && _this.DEBUG) {
          return w.info("Warning: getBills requested without callback");
        } else {
          return callback(error, result);
        }
      });
    };

    Model.sighting = mongoose.model('Sighting', new mongoose.Schema({
      date: {
        type: Date,
        "default": Date.now
      },
      serial: String,
      latitude: Number,
      longitude: Number,
      location: String,
      comment: String,
      submitterId: String
    }));

    Model.sighting.getSightings = function(filterById, callback) {
      var filter,
        _this = this;
      if (this.DEBUG) {
        w.info("getSightings id: " + filterById + " (or all if id is null)");
      }
      filter = {};
      if (filterById) {
        filter = {
          _id: filterById
        };
      }
      return this.find(filter, function(error, result) {
        if (error && _this.DEBUG) w.info("getSightings error: " + error);
        if (_this.DEBUG) w.info("getSightings results: " + result);
        if (!callback && _this.DEBUG) {
          return w.info("Warning: getSightings requested without callback");
        } else {
          return callback(error, result);
        }
      });
    };

    Model.sighting.getSightingsBySerial = function(filterBySerial, callback) {
      var filter,
        _this = this;
      if (this.DEBUG) {
        w.info("getSightingsBySerial serial: " + filterBySerial + " (or all if serial is null)");
      }
      filter = {};
      if (filterBySerial) {
        filter = {
          serial: filterBySerial
        };
      }
      return this.find(filter, function(error, result) {
        if (error && _this.DEBUG) w.info("getSightingsBySerial error: " + error);
        if (_this.DEBUG) w.info("getSightingsBySerial results: " + result);
        if (!callback && _this.DEBUG) {
          return w.info("Warning: getSightingsBySerial requested without callback");
        } else {
          return callback(error, result);
        }
      });
    };

    Model.sighting.getSightingsBySubmitter = function(filterBySubmitterId, callback) {
      var filter,
        _this = this;
      if (this.DEBUG) {
        w.info("getSightingsBySubmitter id: " + filterBySubmitterId + " (or all if id is null)");
      }
      filter = {};
      if (filterBySubmitterId) {
        filter = {
          submitterId: filterBySubmitterId
        };
      }
      return this.find(filter, function(error, result) {
        if (error && _this.DEBUG) {
          w.info("getSightingsBySubmitter error: " + error);
        }
        if (_this.DEBUG) w.info("getSightingsBySubmitter results: " + result);
        if (!callback && _this.DEBUG) {
          return w.info("Warning: getSightingsBySubmitter requested sin callback");
        } else {
          return callback(error, result);
        }
      });
    };

    Model.sighting.saveAndCreateBillIfNecessary = function(sighting, callback) {
      return sighting.save(function(err) {
        if (err && Model.DEBUG) {
          return w.error("Error saving sighting");
        } else {
          return Model.bill.getBillBySerial(sighting.serial, function(err, result) {
            var b;
            if (!result) {
              b = new Model.bill({
                serial: sighting.serial,
                denomination: sighting.denomination,
                currency: sighting.currency
              });
              return b.save(function(err) {
                if (callback) return callback(err);
              });
            } else {
              if (callback) return callback(err, result);
            }
          });
        }
      });
    };

    Model.user = mongoose.model('User', new mongoose.Schema({
      name: String,
      fbId: Number
    }));

    Model.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    Model.getRandomLetter = function() {
      return Model.alphabet[Math.floor(Math.random() * Model.alphabet.length)];
    };

    Model.getRandomDigit = function() {
      return Math.floor(Math.random() * 10);
    };

    Model.getRandomCoordinate = function() {
      return (Math.random() * 180) - 90;
    };

    Model.sighting.getRandom = function() {
      var fakeComment, fakeSerial, n;
      fakeSerial = Model.getRandomLetter().toUpperCase();
      for (n = 0; n <= 10; n++) {
        fakeSerial += Model.getRandomDigit();
      }
      fakeComment = "";
      for (n = 0; n <= 20; n++) {
        fakeComment += Model.getRandomLetter();
      }
      return new Model.sighting({
        serial: fakeSerial,
        latitude: Model.getRandomCoordinate(),
        longitude: Model.getRandomCoordinate(),
        location: "Dummy Location",
        comment: fakeComment
      });
    };

    return Model;

  }).call(this);

}).call(this);
