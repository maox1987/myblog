/**
 * Created by MaoX on 2016/3/16.
 */
var User = require('../models/user');
var crypto = require('crypto');

//Get 注册
exports.showReg =function(req,res,next){
    res.render('reg',{
        title:'注册',
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    });
};

//post 注册
exports.reg =function(req,res){
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
};
//get 登录
exports.showLogin = function(req,res){
    res.render('login', {
        title:'登录',
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    });
};

//post 登录
exports.login = function(req,res){
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
};

exports.logout =function(req,res){
    delete req.session.user;
    req.flash('success','注销成功！');
    res.redirect('/');
};