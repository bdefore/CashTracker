var conf = require('../conf')
,	everyauth = require('everyauth')
, sha1 = require('sha1')
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
    var sighting = new Sighting( { serial: bill.serial, latitude: "", longitude: "", comment: "" });

  	res.render( sighting, { bill: bill } );
  },

  // /sightings/:id

  show: function(req, res, next){
   	DB.getSightings(req.params.id, function(result){
      // TO FIX: Periodic server crashes when result appears to be null
      if(result && result[0]) {
        DB.getBillBySerial(result[0].serial, function(error, bill){
          res.render(result[0], { bill: bill });
        });
      }
      else
      {
        // TO FIX: Better than pass empty object? Inform user of error?
        res.render([], { bill: {} } );
      }
    });
  },

  // /sightings/:id/edit
  
  edit: function(req, res, next){
  	if(req.params.id)
  	{
	   	DB.getSightings(req.params.id, function(result)
      {
        if(result && result[0])
        {
  		    DB.getBillBySerial(result[0].serial, function(error, bill)
          {
            res.render(result[0], { bill: bill });
  		  	});
        }
        else
        {
          res.redirect('/sightings/add');
        }
	    });
  	}
  	else
  	{
	   	res.redirect('/sightings/add');
  	}
  },

  // PUT /sightings/:id
  
  update: function(req, res, next){
    var sighting = new Sighting( req.body.sighting )

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
      // If user is logged in, tag their id to this submission
      if(req.user)
      {
        sighting.submitterId = req.user.id;
      }

      Sighting.findById(sighting.id, function(error, result){

        if(result)
        {
          console.log("Updating existing entry")

          Sighting.update(
              { _id: sighting._id },
              { serial: sighting.serial, latitude: sighting.latitude, longitude: sighting.longitude, comment: sighting.comment },
              null,
              function(error) {
                if(error)
                {
                  console.log ("Error updating entry: " + error)
                  req.flash('error', 'Failed to update entry.');
                  res.redirect('/sightings');
                }
                else
                {
                  console.log ("=== Successful update === ")
                  req.flash('success', 'Successfully updated entry.');
                  res.redirect('/sightings');
                }
                  
              });
        }
        else
        {
          // New sighting, save new entry
          console.log("Saving new entry: '" + result + "'")
          sighting.save();

          // If there's no existing bill of this sighting, create an entry for it
          DB.getBillBySerial(sighting.serial, function(error, result){
            if(!result)
            {
              new Bill( { serial: sighting.serial, denomination: sighting.denomination, currency: sighting.currency } ).save();
              console.log("saved new sighting to new record");
              req.flash('success', 'Successfully saved sighting. First record of this bill!');
              res.redirect('/sightings');
            }
            else
            {
              console.log("saved new sighting to preexisting record: " + result);
              req.flash('success', 'Successfully saved sighting. Bill has been seen before!');
              res.redirect('/sightings');
            }
          });          
        }
      });     
    }
  }
};