// BASE SETUP
// ==============================================
require('dotenv').config()

var express = require('express');
var bodyParser = require('body-parser')

var app     = express();
var port    =   process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));

// ROUTES
// ==============================================
app.use(require('./src/controllers'));


// START THE SERVER
// ==============================================
app.listen(port);
console.log('Magic happens on port ' + port);