/**
 * Created by MaoX on 2016/3/10.
 */

var mongoose = require('mongoose');
var UserSchema = require('../schemas/user');
var User = mongoose.model('User',UserSchema);

module.exports = User;



