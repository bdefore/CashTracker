var conf = require('../conf')
,	everyauth = require('everyauth')
, DB = require('../db.js');

var Bill = DB.Bill;
var Sighting = DB.Sighting;

module.exports = {

  // /sightings
  
  index: function(req, res){
    DB.getSightings(null, res.render);
  },

  // /sightings/add

  add: function(req, res, next){
    // TO FIX: Blank object construction shouldn't be necessary. Validate forms instead.
    // TO FIX: Default to 10?
    var bill = new Bill( { serial: "", currency: "Euro", denomination: 10 } );
    var sighting = new Sighting( { date: new Date(), serial: bill.serial, latitude: "", longitude: "", comment: "" });
  	res.render( sighting, { bill: bill } );
  },

  // /sightings/:id

  show: function(req, res, next){
   	DB.getSightings(req.params.id, function(result){
      // TO FIX: Periodic server crashes when result appears to be null
      if(result || result[0]) {
        DB.getBillBySerial(result[0].serial, function(error, bill){
          res.render(result[0], { bill: bill });
        });
      }
    });
  },

  // /sightings/:id/edit
  
  edit: function(req, res, next){
  	if(req.params.id)
  	{
	   	DB.getSightings(req.params.id, function(result){
		    DB.getBillBySerial(result[0].serial, function(error, bill){
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

    // TO FIX: Move to utils class
    
    // Validate
    // Euro example: X18084287225
    // USD example: CE24659434D (E5 underneath that) on a 20
    if(sighting.serial.length != 12)
    {

      req.flash('info', 'Serial must contain 12 characters, the first beginning with a letter');
      res.redirect('/sightings/add');
    }
    else
    {
      var s = new Sighting( { date: new Date(), serial: sighting.serial, latitude: sighting.latitude, longitude: sighting.longitude, comment: sighting.comment } )
      
      // If user is logged in, tag their id to this submission
      if(req.user)
      {
        s.submitterId = req.user.id;
      }
      s.save();

      // If there's no existing bill of this sighting, create an entry for it
      DB.getBillBySerial(sighting.serial, function(error, result){
        if(!result)
        {
          new Bill( { serial: sighting.serial, denomination: sighting.denomination, currency: sighting.currency } ).save();
          console.log("saved new sighting to new record");
          req.flash('info', 'Successfully saved to new record');
          res.redirect('/sightings');
        }
        else
        {
          console.log("saved new sighting to preexisting record: " + result);
          req.flash('info', 'Successfully saved to preexisting record');
          res.redirect('/sightings');
        }
      });   
    }
  }
};