/**
 * Created by MaoX on 2016/3/16.
 */
var Article = require('../models/article');
var User = require('../models/user');

exports.index = function(req,res,next){
    var page ={};
    page.p = parseInt(req.query.p) || 0;
    page.s = 10;
    Article.count({},function(err,total){
        if(err){
            return res.send(err);
        }
        page.max = Math.ceil(total/page.s);
        Article.find({}).skip(page.p*page.s).limit(page.s).sort('-meta.createAt').exec(function(err,articles){
            if(err){
                articles =[];
            }
            res.render('index',{
                title:'主页',
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                articles:articles,
                page:page
            });
        });
    });
};

exports.showUpload =function(req,res){
    res.render('upload',{
        title:'文件上传',
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    });
};

exports.upload = function(req,res,next){
    console.log(req.files[0].filename);
    console.log(req.files[0].path);
    req.flash('success','文件上传成功！');
    res.redirect('/upload');
};

exports.links = function(req,res){
    res.render('links',{
        title:'友情链接',
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    });
};