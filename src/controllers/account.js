var DB = require('../db.js');

var Bill = DB.Bill;
var Sighting = DB.Sighting;

module.exports = {

  index: function(req, res){
	
	everyauth = require('everyauth')

	if(!req.user)
	{
		req.flash('info', "Oi! You're not logged in.");
	  	res.redirect('/');
	}
	else
	{
	   	DB.getSightingsBySubmitter(req.user.id, function(result){

	   		var relatedBills = [];
			var sightings = result;

	   		// TO FIX: We keep track of how many sightings have been matched
	   		// to bills this way, and don't render the page until n DB requests
	   		// have been made for each of them. Feels very caveman and needs to
	   		// have a better solution to scale. Perhaps storing this information
	   		// to a table specific to user is better.
			var totalToCheck = result.length;
			var currentCheck = 0;

			if(sightings.length > 0)
			{
				for(var index in sightings)
				{
					var sighting = sightings[index];
					console.log("sighting: " + sighting)

					DB.getBillBySerial(sighting.serial, function(error, bill) {
						relatedBills.push(bill);
						currentCheck++;

						console.log('Related bill received: ' + bill.serial + " lookup: " + currentCheck + " of " + totalToCheck)

						if(currentCheck == totalToCheck)
						{
					  		res.render(null, { sightings: sightings, bills: relatedBills });
						}
					});
				};
			}
			else
			{
				// User has not entered any sightings, would not otherwise get to 
				// render step
				res.render(null, { sightings: sightings, bills: relatedBills });
			}
	    });
	}
  }
};