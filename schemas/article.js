/**
 * Created by MaoX on 2016/3/11.
 */
var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
    title:String,
    content:String,
    author:String,
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
    next();
});

module.exports = ArticleSchema;