
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
  serial        : String,
  denomination  : Number,
  currency      : String
});
mongoose.model('Bill', BillSchema);
var Bill = mongoose.model('Bill');

var SightingSchema = new Schema({
  serial        : String,
  latitude	    : Number,
  longitude     : Number,
  comment	    : String
});
mongoose.model('Sighting', SightingSchema);
var Sighting = mongoose.model('Sighting');

console.log("Checking for existing data...")

var sightingTest = Sighting.findOne( { id: 0 }, function(error, result) {
	if(!result)
	{
		console.log("No sightings found, filling with dummy data...");

		new Bill( { serial: 'X18084287225', denomination: 20, currency: 'euro' } ).save();
		new Bill( { serial: 'Y81450250492', denomination: 10, currency: 'euro' } ).save();
 
		new Sighting( { serial: 'X18084287225', latitude: "41.377301033335414", longitude: "2.189307280815329", comment: 'I got this from my mother' } ).save();
		new Sighting( { serial: 'Y81450250492', latitude: "31.377301033335414", longitude: "-32.189307280815329", comment: 'I got this from a restaurant' } ).save();
		new Sighting( { serial: 'Y81450250492', latitude: "-41.377301033335414", longitude: "9.189307280815329", comment: 'I got this from a bar' } ).save();
		new Sighting( { serial: 'Y81450250492', latitude: "11.377301033335414", longitude: "12.189307280815329", comment: 'I got this from somewhere' } ).save();

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