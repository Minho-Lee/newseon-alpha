'use strict';

let fs = require('fs');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
var cfenv = require('cfenv');

const watson = require('watson-developer-cloud');
const vcapServices = require('vcap_services');


app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function (req, res) {
  res.render('main.ejs');
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



// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function () {
  // print a message when the server starts listening
  console.log("Server starting on " + appEnv.url);
});