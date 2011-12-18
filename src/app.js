
/**
 * Module dependencies.
 */

var app = require('express').createServer();

require('./db').boot();
require('./mvc').boot(app);

app.listen(3000);

// var growl = require("growl");
// growl("Express app started on port 3000");
console.log('Express app started on port 3000');