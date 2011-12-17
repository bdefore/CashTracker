var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cashtracker');

console.log("MongoDB connection success...")

var Sighting = mongoose.model('Sighting');

function getSightings(filterByBillId, callback) {
  console.log("getting sighting of sighting id: " + filterByBillId + " (or all if id is null)")
  filter = {};
  if(filterByBillId) filter = { bill_id: filterByBillId };
  Sighting.find( filter, function(error, result) {
    if(error) console.log("Error getting sightings: " + error);
    console.log("results: " + result)
    if(!callback) console.log("Warning: sightings requested without callback")
    else callback(result);
  });
}

module.exports = {
  
  // /sightings
  
  index: function(req, res){
    getSightings(null, res.render);
  },

  // /sightings/:id

  show: function(req, res, next){
    getSightings(req.params.id, function(result){
      res.render(result);
    });
  }

// DISABLED: Needs a way of disambiguating bill id from sighting id
  // /sightings/:id/edit
  
  // edit: function(req, res, next){
  //   getSightings(req.params.id, function(result){
  //     res.render(result[0]);
  //   });
  // }

  // PUT /sightings/:id
  
// DISABLED: Needs update to use mongodb integration

  // update: function(req, res, next){
  //   var id = req.params.id;
  //   sightings(id, function(err){
  //     if (err) return next(err);
  //     var sighting = sightings()[id] = req.body.sighting;
  //     sighting.id = id;
  //     req.flash('info', 'Successfully updated _' + sighting.serial + '_.');
  //     res.redirect('back');
  //   });
  // }
};