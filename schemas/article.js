/**
 * Created by MaoX on 2016/3/11.
 */
var mongoose = require('mongoose');
var ObjectId =mongoose.Schema.Types.ObjectId;

var ArticleSchema = new mongoose.Schema({
    title:String,
    content:String,
    author:String,
    tags:[String],
    comments:[{type:ObjectId,ref:'Comment'}],
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

ArticleSchema.pre('save',function(next){
    if(this.isNew){
        this.meta.createAt = this.meta.updateAt = Date.now();
    }else{
        this.meta.updateAt = Date.now();
    }
    this.tags = this.tags.map(function(item){
        return item.trim();
    });
    next();
});

module.exports = ArticleSchema;

ArticleSchema.statics.getTags = function(callback){
    this.find({}).distinct('tags').exec(function(err,tags){
        if(err){
            return callback(err);
        }

        return callback(null,tags);
    })
};