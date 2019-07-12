// load the things we need
var express = require('express');
var bodyParser = require("body-parser");
//var cookieParser = require('cookie-parser');
var session = require('express-session');


//var flash = require('req-flash');

var app = express();

const routes_config = require('./routes/routes.config');

//app.use(cookieParser());
//app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }))
app.use(session({ secret: 'keyboard cat'}));
//app.use(flash());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true
}));


// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
// use res.render to load up an ejs view file
routes_config.routesConfig(app);


app.listen(8181);
console.log('8181 is the magic port');