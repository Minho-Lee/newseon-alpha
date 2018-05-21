var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  userid: String,
  email: String,
  profile_url: String,
  updated_at: { type: Date, default: Date.now },
});

UserSchema.statics.findOrCreate = require("find-or-create");

UserModel = mongoose.model('User', UserSchema, "users");

module.exports = UserModel;
