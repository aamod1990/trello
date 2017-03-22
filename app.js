var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config.js');

// configuration =========================
mongoose.connect(config.database.url); // connect to our database

mongoose.connection.once('connected', function() {
	console.log("Connected to database");
})
require('./libs/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev'));
app.use(cookieParser()); /* read cookies (needed for auth)& */
app.use(bodyParser.json()); /* get information from html forms */

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));

/**** required for passport ***/
app.use(session({
	secret: '211232ksdfsdsdwe2w343dsslsm3mnfkds'
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes/index.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(config.port);
console.log('The server is running on port ' + config.port);