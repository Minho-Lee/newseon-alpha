'use strict';

require('dotenv').config({
  silent: true
});

let fs = require('fs');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
var path = require('path');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var passport = require('passport');
var session = require('express-session');

const watson = require('watson-developer-cloud');
const vcapServices = require('vcap_services');

var auth = require('./routes/auth');

var AllowedUser = require('./models/allowed_model');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MLAB_DB, {
    useMongoClient: true
  })
  .then(() => console.log('connection successful'))
  .catch((err) => console.error(err));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
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
  res.render('main.ejs', {
    user: {
      "_id": {
        "$oid": "5ae9b455f57de7060e8e6b5e"
      },
      "userid": "115589406670306456769",
      "profile_url": "https://lh5.googleusercontent.com/-P35CIab5egM/AAAAAAAAAAI/AAAAAAAAABE/HZkT57GdXeY/photo.jpg?sz=50",
      "name": "Sample ",
      "__v": 0,
      "updated_at": {
        "$date": "2018-05-02T12:51:40.411Z"
      }
    }
  });
});

app.get('/', ensureAuthenticated, function (req, res) {
  AllowedUser.find({}, {}, function (err, doc) {
    if (err) {
      console.log('got an error ' + err);
    }
    if (JSON.stringify(doc[0].emails).includes(req.user.email)) {
      res.render('main.ejs', {
        user: req.user
      });
    } else {
      console.log("rejected");
      res.redirect('/auth/login');
    }
  });


});


app.get('/landingpage', function (req, res) {
  res.render('landingpage.ejs');
});

app.get('/users', ensureAuthenticated, function (req, res, next) {
  console.log(JSON.stringify(req.user));
  res.render('user.ejs', {
    user: req.user
  });
});

app.get('/discover', ensureAuthenticated, function (req, res, next) {
  AllowedUser.find({}, {}, function (err, doc) {
    if (err) {
      console.log('got an error ' + err);
    }

    var allowedEmails = JSON.stringify(doc[0].emails);

    if (doc != null) {
      if (allowedEmails.includes(req.user.email)) {
        //if (allowedEmails.includes("sunnyashiin@gmail.com")) {
        res.render('discover.ejs', {
          section: req.query.section
        });
      } else {
        console.log("rejected");
        res.redirect('/auth/login');
      }
    } else {
      console.log("rejected");
      res.redirect('/auth/login');
    }

  });
});
var appEnv = process.env;

// text to speech token endpoint
var ttsAuthService = new watson.AuthorizationV1(
  Object.assign({
      username: process.env.TTS_USERNAME, // or hard-code credentials here
      password: process.env.TTS_PASSWORD
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
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login')
}

var port = process.env.PORT || process.env.VCAP_APP_PORT || 6008;

app.listen(port, function () {
  console.log('Server running on port: %d', port);
});