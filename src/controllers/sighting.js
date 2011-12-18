var mongoose = require('mongoose')
,	conf = require('../conf')
,	everyauth = require('everyauth');

mongoose.connect(conf.database);

console.log("MongoDB connection success...")

var Bill = mongoose.model('Bill');

function getBillBySerial(filterBySerial, callback) {
  console.log("getting bill of serial: " + filterBySerial)
  Bill.findOne( { serial: filterBySerial }, function(error, result) {
    if(error) console.log("Error getting bills: " + error);
    console.log("results: " + result)
    if(!callback) console.log("Warning: bills requested without callback")
    else callback(error, result);
  });
}

var Sighting = mongoose.model('Sighting');

function getSightings(filterById, callback) {
  console.log("getting sighting of id: " + filterById + " (or all if id is null)")
  filter = {};
  if(filterById) filter = { _id: filterById };
  Sighting.find( filter, function(error, result) {
    if(error) console.log("Error getting sightings: " + error);
    console.log("results: " + result)
    if(!callback) console.log("Warning: sightings requested without callback")
    else callback(result);
  });
}

function getUser(id, callback) {
  console.log("getting user of id: " + id)
  User.findOne( { id: id }, function(error, result) {
    if(error) console.log("Error getting user: " + error);
    console.log("results: " + result)
    if(!callback) console.log("Warning: sightings requested without callback")
    else callback(result);
  });
}

module.exports = {
  
  // /sightings
  
  index: function(req, res){
    console.log('in index')
    getSightings(null, res.render);
  },

  // /sightings/add

  add: function(req, res, next){
    // TO FIX: Blank object construction shouldn't be necessary. Validate forms instead.
    var bill = new Bill( { serial: "", currency: "", denomination: 10 } );
    var sighting = new Sighting( { serial: bill.serial, latitude: "", longitude: "", comment: "" });
    var facebook = {};
    if(everyauth.user) facebook = everyauth.user.facebook;
  	res.render( sighting, { bill: bill, facebook: facebook } );
  },

  // /sightings/:id

  show: function(req, res, next){
   	getSightings(req.params.id, function(result){
      // TO FIX: Periodic server crashes when result appears to be null
      if(result || result[0]) {
        getBillBySerial(result[0].serial, function(error, bill){
          res.render(result[0], { bill: bill });
        });
      }
    });
  },

  // /sightings/:id/edit
  
  edit: function(req, res, next){
  	if(req.params.id)
  	{
	   	getSightings(req.params.id, function(result){
		    getBillBySerial(result[0].serial, function(error, bill){
		   		res.render(result[0], { bill: bill });
		  	});
	    });
  	}
  	else
  	{
	   	res.render( new Sighting(), { bill: new Bill() } );
  	}
  },

  // PUT /sightings/:id
  
  update: function(req, res, next){
  	var sighting = req.body.sighting;
	new Sighting( { serial: sighting.serial, latitude: sighting.latitude, longitude: sighting.longitude, comment: sighting.comment } ).save();
  	getBillBySerial(sighting.serial, function(error, result){
  		if(!result)
  		{
	  		new Bill( { serial: sighting.serial, denomination: sighting.denomination, currency: sighting.currency } ).save();
	  		console.log("saved new sighting to new bill");
	  		req.flash('info', 'Successfully saved to new bill');
	  		res.redirect('/sightings');
  		}
  		else
  		{
  			console.log("saved new sighting to preexisting bill: " + result);
	  		req.flash('info', 'Successfully saved to preexisting bill');
  			res.redirect('/sightings');
  		}
  	});  	
  }
};