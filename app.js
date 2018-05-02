'use strict';

let fs = require('fs');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
var cfenv = require('cfenv');
var path = require('path');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

const watson = require('watson-developer-cloud');
const vcapServices = require('vcap_services');

var auth = require('./routes/auth');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://sssaini1:sssaini1@ds237389.mlab.com:37389/node-passport-social', { useMongoClient: true })
  .then(() =>  console.log('connection successful'))
  .catch((err) => console.error(err));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 's3cr3t',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', auth);

app.use(express.static(__dirname + '/public'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/app', function (req, res) {
  res.render('main.ejs', { user: {
    "_id": {
        "$oid": "5ae9b455f57de7060e8e6b5e"
    },
    "userid": "115589406670306456769",
    "profile_url": "https://lh5.googleusercontent.com/-P35CIab5egM/AAAAAAAAAAI/AAAAAAAAABE/HZkT57GdXeY/photo.jpg?sz=50",
    "name": "Sukhpal Saini",
    "__v": 0,
    "updated_at": {
        "$date": "2018-05-02T12:51:40.411Z"
    }
} });
});

app.get('/', ensureAuthenticated, function (req, res) {
	  console.log(JSON.stringify(req.user));
  res.render('main.ejs', { user: req.user });
});
app.get('/landingpage', function (req, res) {
  res.render('landingpage.ejs');
});
app.get('/sidebar', function (req, res) {
  res.render('sidebar.ejs');
});
app.get('/app', function (req, res) {
  res.render('app.ejs');
});

app.get('/home', function (req, res) {
  res.render('home.ejs');
});
app.get('/sports', function (req, res) {
  res.render('sports.ejs');
});
app.get('/science', function (req, res) {
  res.render('science.ejs');
});
app.get('/technology', function (req, res) {
  res.render('tech.ejs');
});
app.get('/politics', function (req, res) {
  res.render('politics.ejs');
});
app.get('/business', function (req, res) {
  res.render('business.ejs');
});

app.get('/testingpage', function (req, res) {
  res.render('testingpage.ejs');
});

app.get('/users', ensureAuthenticated, function(req, res, next) {
  console.log(JSON.stringify(req.user));
  res.render('user.ejs', { user: req.user });
});

app.get('/discover', function (req, res) {
  res.render('discover.ejs', {
    section: req.query.section
  });
});
var appEnv = cfenv.getAppEnv();

// text to speech token endpoint
var ttsAuthService = new watson.AuthorizationV1(
  Object.assign({
      username: "47c46cde-c5ea-4073-a1ad-b7fb5e17e089", // or hard-code credentials here
      password: "TFmq1It70lAo"
    },
    vcapServices.getCredentials('text_to_speech') // pulls credentials from environment in bluemix, otherwise returns {}
  )
);
app.use('/api/text-to-speech/token', function (req, res) {
  ttsAuthService.getToken({
      url: watson.TextToSpeechV1.URL
    },
    function (err, token) {
      if (err) {
        console.log('Error retrieving token: ', err);
        res.status(500).send('Error retrieving token');
        return;
      }
      res.send(token);
    }
  );
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/login')
}


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function () {
  // print a message when the server starts listening
  console.log("Server starting on " + appEnv.url);
});