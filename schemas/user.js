/**
 * Created by MaoX on 2016/3/11.
 */
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true
    },
    password:String,
    email:String,
    head:String,
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

UserSchema.pre('save',function(next){
    if(this.isNew){
        this.meta.createAt = this.meta.updateAt = Date.now();
    }else{
        this.meta.updateAt = Date.now();
    }
    next();
});

module.exports = UserSchema;