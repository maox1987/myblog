/**
 * Created by MaoX on 2016/3/12.
 */
var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    content:String,
    from:String,
    meta:{
        createAt:{
            type:Date,
            default:Date.now()
        },
        updateAt:{
            type:Date,
            default:Date.now()
        }
    }
});

CommentSchema.pre('save',function(next){
    if(this.isNew){
        this.meta.createAt = this.meta.updateAt = Date.now();
    }else{
        this.meta.updateAt = Date.now();
    }
    next();
});

module.exports = CommentSchema;