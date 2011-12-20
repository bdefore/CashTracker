var DB = require('../db.js');

var Bill = DB.Bill;
var Sighting = DB.Sighting;

module.exports = {
  
  // /bills
  
  index: function(req, res){
    DB.getBills(null, res.render);
  },

  // /bills/:id

  show: function(req, res, next){
    console.log("id: " + req.params.id)
    DB.getSightingsBySerial(req.params.id, function(result){
      // TO FIX: Poor form. Hijacking the framework here.
      res.render(null, { sightings: result });
    });
  }

};