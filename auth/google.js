var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user_model');

passport.use(new GoogleStrategy({
  clientID: "668895022164-tcfccvvs5jqrj21jqqqnv46ici1g5env.apps.googleusercontent.com",
  clientSecret: "WoXTSjq1bP6lWkBoNMrPBvtj",
  callbackURL: "https://newseon.io/auth/google/callback"
},
  function (accessToken, refreshToken, profile, done) {
    console.log(profile);

    User.findOrCreate({ userid: profile.id }, { name: profile.displayName, userid: profile.id, email: profile.emails[0].value, profile_url: profile.photos[0].value }, function (err, user) {
      return done(err, user);
    });
  }
));

module.exports = passport;
