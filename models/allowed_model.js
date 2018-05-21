// allowed users referred to by email, gives exclusive access to the customers
var mongoose = require('mongoose');

var AllowedUserSchema = new mongoose.Schema({
  emails:[String]
});

AllowedUserSchema.statics.findOrCreate = require("find-or-create");

AllowedUserModel = mongoose.model('AllowedUser', AllowedUserSchema, "allowedusers");

module.exports = AllowedUserModel;
