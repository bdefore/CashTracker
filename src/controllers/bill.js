var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cashtracker');

console.log("MongoDB connection success...")

var Bill = mongoose.model('Bill');

function getBills(filterBySerial, callback) {
  console.log("getting bill by serial: " + filterBySerial + " (or all if serial is null)")
  filter = {};
  if(filterBySerial) filter = { serial: filterBySerial };
  Bill.find( filter, function(error, result) {
    if(error) console.log("Error getting bills: " + error);
    console.log("results: " + result)
    if(!callback) console.log("Warning: bills requested without callback")
    else callback(result);
  });
}

var Sighting = mongoose.model('Sighting');

function getSightingsBySerial(filterBySerial, callback) {
  console.log("getting sighting of serial: " + filterBySerial + " (or all if serial is null)")
  filter = {};
  if(filterBySerial) filter = { serial: filterBySerial };
  Sighting.find( filter, function(error, result) {
    if(error) console.log("Error getting sightings: " + error);
    console.log("results: " + result)
    if(!callback) console.log("Warning: sightings requested without callback")
    else callback(result);
  });
}

module.exports = {
  
  // /bills
  
  index: function(req, res){
    getBills(null, res.render);
  },

  // /bills/:id

  show: function(req, res, next){
    console.log("id: " + req.params.id)
    getSightingsBySerial(req.params.id, function(result){
      // TO FIX: Poor form. Hijacking the framework here.
      res.render(null, { sightings: result });
    });
  }

};