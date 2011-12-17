var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cashtracker');

console.log("MongoDB connection success...")

var Sighting = mongoose.model('Sighting');

function getBills(filterBySerial, callback) {
  console.log("getting sighting of sighting id: " + filterBySerial + " (or all if id is null)")
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
  
  // index: function(req, res){
  //   getBills(null, res.render);
  // },

  // /bills/:id

  show: function(req, res, next){
    getBills(req.params.id, function(result){
      res.render(result);
    });
  },
  
  // /bills/:id/edit
  
  // edit: function(req, res, next){
  //   getBills(req.params.id, function(result){
  //     res.render(result[0]);
  //   });
  // }

  // PUT /bills/:id
  
// DISABLED: Needs update to use mongodb integration

  // update: function(req, res, next){
  //   var id = req.params.id;
  //   bills(id, function(err){
  //     if (err) return next(err);
  //     var bill = bills()[id] = req.body.bill;
  //     bill.id = id;
  //     req.flash('info', 'Successfully updated _' + bill.serial + '_.');
  //     res.redirect('back');
  //   });
  // }
};