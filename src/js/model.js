(function() {
  var Model;

  module.exports = Model = (function() {
    var mongoose;

    function Model() {}

    Model.DEBUG = false;

    mongoose = require('mongoose');

    Model.bill = mongoose.model('Bill', new mongoose.Schema({
      serial: String,
      denomination: Number,
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
        if (error) if (_this.DEBUG) w.info("getBillBySerial error: " + error);
        if (_this.DEBUG) w.info("getBillBySerial results: " + result);
        if (!callback) {
          if (_this.DEBUG) {
            return w.info("Warning: getBillBySerial requested without callback");
          }
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
        if (error) if (_this.DEBUG) w.info("getBills error: " + error);
        if (_this.DEBUG) w.info("getBills results: " + result);
        if (!callback) {
          if (_this.DEBUG) {
            return w.info("Warning: getBills requested without callback");
          }
        } else {
          return callback(result);
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
        if (error) if (_this.DEBUG) w.info("getSightings error: " + error);
        if (_this.DEBUG) w.info("getSightings results: " + result);
        if (!callback) {
          if (_this.DEBUG) {
            return w.info("Warning: getSightings requested without callback");
          }
        } else {
          return callback(result);
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
        if (error) if (_this.DEBUG) w.info("getSightingsBySerial error: " + error);
        if (_this.DEBUG) w.info("getSightingsBySerial results: " + result);
        if (!callback) {
          if (_this.DEBUG) {
            return w.info("Warning: getSightingsBySerial requested without callback");
          }
        } else {
          return callback(result);
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
        if (error) {
          if (_this.DEBUG) w.info("getSightingsBySubmitter error: " + error);
        }
        if (_this.DEBUG) w.info("getSightingsBySubmitter results: " + result);
        if (!callback) {
          if (_this.DEBUG) {
            return w.info("Warning: getSightingsBySubmitter requested sin callback");
          }
        } else {
          return callback(result);
        }
      });
    };

    Model.user = mongoose.model('User', new mongoose.Schema({
      name: String,
      fbId: Number
    }));

    return Model;

  })();

}).call(this);
