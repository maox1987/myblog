/**
 * Created by MaoX on 2016/3/12.
 */
var mongoose = require('mongoose');
var CommentSchema = require('../schemas/comments');
var Comment = mongoose.model('Comment',CommentSchema);

module.exports = Comment;