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
    pv:{
        type:Number,
        default:0
    },
    reprint:{
        from:{type:ObjectId,ref:'Article'},
        to:[{type:ObjectId,ref:'Article'}]

    },
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
    if(this.tags && this.tags.length>0){
        this.tags = this.tags.map(function(item){
            return item.trim();
        });
    }

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
ArticleSchema.statics.reprint = function(fromId,userId,callback){
    var to = new mongoose.models.Article();
    this.findByIdAndUpdate(fromId,{$push: {'reprint.to':to._id}},function(err,from){
        if(err){
            return callback(err);
        }
        if(!from){
            return callback('文章不存在');
        }

        to.author =userId;
        to.content = from.content;
        to.title = (from.title.search(/[转载]/)>-1)?from.title:'[转载]'+from.title;
        to.reprint.from = from._id;
        to.tags = from.tags;

        to.save(function(err,to){
            if(err){
                return callback(err);
            }
            return callback(null,to);
        });

    });
};