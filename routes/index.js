/**
 * Created by MaoX on 2016/3/9.
 */
var crypto = require('crypto');
var User = require('../models/user');
var multer = require('multer');//文件上传
var Article = require('../models/Article');

var upload = multer({
    storage:multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,'./public/images/');
        },
        filename:function(req,file,cb){
            cb(null,file.originalname);
        }
    })
});

module.exports = function(app){
    app.get('/',function(req,res){
        Article.find({},function(err,articles){
            if(err){
                articles =[];
            }
            res.render('index',{
                title:'主页',
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                articles:articles
            });
        });

    });

    app.get('/reg',checkNotLogin, function(req,res){
        res.render('reg',{
            title:'注册',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/reg',checkNotLogin, function(req,res){
        var name = req.body.name;
        var password = req.body.password;
        var password_re = req.body['password-repeat'];

        if(password != password_re){
            req.flash('error','两次输入的密码不一致！');
            return res.redirect('/reg');
        }

        var md5 = crypto.createHash('md5');
        password =md5.update(password).digest('hex');
        var newUser = new User({
            name: name,
            password:password,
            email:req.body.email
        });

        User.findOne({name:newUser.name},function(err,user){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            if(user){
                req.flash('error','用户已存在');
                return res.redirect('/reg');
            }

            newUser.save(function(err,user){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.flash('success','注册成功！');
                res.redirect('/');
            });
        });
    });

    app.get('/login',checkNotLogin, function(req,res){
        res.render('login', {
            title:'登录',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/login',checkNotLogin, function(req,res){
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');

        User.findOne({name:req.body.name},function(err,user){
            if(!user){
                req.flash('error','用户不存在！');
                return res.redirect('/login');
            }

            if(user.password != password){
                req.flash('error','密码错误！');
                return res.redirect('/login');
            }

            req.session.user = user;
            req.flash('success','登录成功！');
            res.redirect('/');
        })
    });

    app.get('/post',checkLogin, function(req,res){
        res.render('post',{
            title:'发表',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/post',checkLogin, function(req,res){

        var article = new Article(req.body.article);
        article.author = req.session.user.name;


        article.save(function(err,article){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','发布成功！');
            res.redirect('/');
        })
    });

    app.get('/logout',checkLogin, function(req,res){
        delete req.session.user;
        req.flash('success','注销成功！');
        res.redirect('/');
    });

    app.get('/upload',checkLogin,function(req,res){
        res.render('upload',{
            title:'文件上传',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });
    app.post('/upload',checkLogin,upload.array('files',2),function(req,res,next){
        console.log(req.files[0].filename);
        console.log(req.files[0].path);
        req.flash('success','文件上传成功！');
        res.redirect('/upload');
    });

    app.get('/u/:name',function(req,res){
        User.findOne({name:req.params.name},function(err,user){
            if(!user){
                req.flash('error','用户不存在！');
                return res.redirect('/');
            }

            Article.find({author:user.name},function(err,articles){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/');
                }
                res.render('user',{
                    title:user.name,
                    articles:articles,
                    success:req.flash('success').toString(),
                    error:req.flash('error').toString()
                });
            });
        });
    });


    app.get('/article/:id',function(req,res){
        Article.findOne({_id:req.params.id},function(err,article){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('article',{
                title:article.title,
                article:article,
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });
        });
    });

    function checkLogin(req,res,next){
        if(!req.session.user){
            req.flash('error','未登录！');
            res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req,res,next){
        if(req.session.user){
            req.flash('error','已登录！');
            res.redirect('back');
        }
        next();
    }
};