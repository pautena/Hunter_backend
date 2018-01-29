// BASE SETUP
// ==============================================
const nemLibrary = require("nem-library");
const NEMLibrary = nemLibrary.NEMLibrary;
const NetworkTypes = nemLibrary.NetworkTypes;

require('dotenv').config()

var express = require('express');
var bodyParser = require('body-parser')

var app     = express();
var port    =   process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));

// Initialize NEMLibrary for TEST_NET Network
// ==============================================
NEMLibrary.bootstrap(NetworkTypes.TEST_NET);

// ROUTES
// ==============================================
app.use(require('./src/controllers'));

//Listeners
// ==============================================
require('./src/listeners/ConfirmedTransactionListener');


// START THE SERVER
// ==============================================
app.listen(port);
console.log('Magic happens on port ' + port);
