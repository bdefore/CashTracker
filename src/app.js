
/**
 * Module dependencies.
 */

var express = require('../lib/express')
    , mongoose = require('mongoose')
	, jade = require('jade');

// Mongodb schema

mongoose.connect('mongodb://localhost/cashtracker');

console.log("MongoDB connection success...")

var Schema = mongoose.Schema;
  
var BillSchema = new Schema({
  id            : Number,
  serial        : String,
  denomination  : Number,
  currency      : String
});
mongoose.model('Bill', BillSchema);
var Bill = mongoose.model('Bill');

var SightingSchema = new Schema({
  id            : Number,
  serial        : String,
  latitude	    : String,
  longitude     : String,
  comment	    : String
});
mongoose.model('Sighting', SightingSchema);
var Sighting = mongoose.model('Sighting');

console.log("Checking for existing data...")

var sightingTest = Sighting.findOne( { id: 0 }, function(error, result) {
	if(!result)
	{
		console.log("No sightings found, filling with dummy data...");

		new Bill( { id: 0, serial: 'X18084287225', denomination: 20, currency: 'euro' } ).save();
		new Bill( { id: 1, serial: 'Y81450250492', denomination: 10, currency: 'euro' } ).save();

		new Sighting( { id: 0, serial: 'X18084287225', latitude: "43°20'N", longitude: "8°25'W", comment: 'I got this from my mother' } ).save();
		new Sighting( { id: 1, serial: 'Y81450250492', latitude: "37°27'N", longitude: "03°57'W", comment: 'I got this from a restaurant' } ).save();
		new Sighting( { id: 2, serial: 'Y81450250492', latitude: "34°27'N", longitude: "05°57'W", comment: 'I got this from a bar' } ).save();
		new Sighting( { id: 3, serial: 'Y81450250492', latitude: "35°27'N", longitude: "01°57'W", comment: 'I got this from somewhere' } ).save();

		console.log("Dummy data created...")
	}	
	else
	{
		console.log("Found a sighting... skipping dummy data creation...")		
	}
});

var app = express.createServer();

require('./mvc').boot(app);

app.listen(3000);

console.log('Express app started on port 3000');