/**
 * Created by MaoX on 2016/3/9.
 */

var User = require('../app/controllers/user');
var multer = require('multer');//文件上传
var Article= require('../app/controllers/article');
var Index = require('../app/controllers/index');
var Comment = require('../app/controllers/comments');
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
    app.get('/',Index.index);

    app.get('/reg',checkNotLogin, User.showReg);

    app.post('/reg',checkNotLogin, User.reg);

    app.get('/login',checkNotLogin,User.showLogin);

    app.post('/login',checkNotLogin, User.login);

    app.get('/post',checkLogin, Article.showPost);

    app.post('/post',checkLogin, Article.post);

    app.get('/logout',checkLogin, User.logout);

    app.get('/upload',checkLogin,Index.showUpload);
    app.post('/upload',checkLogin,upload.array('files',2),Index.upload);

    app.get('/u/:name',Article.getByUser);


    app.get('/article/:id',Article.getById);

    app.get('/article/:id/edit',checkLogin,Article.showEdit);

    app.post('/article/:id/edit',checkLogin,Article.edit);

    app.get('/article/:id/remove',checkLogin,Article.remove);

    app.get('/article/:id/reprint',checkLogin,Article.reprint);

    app.post('/article/:id/comment',checkLogin,Comment.post);

    app.get('/archive',Article.archive);

    app.get('/tags',Article.tags);

    app.get('/tags/:tag',Article.getByTag);

    app.get('/search',Article.search);

    app.get('/links',Index.links);

    app.use(function(req,res){
        res.render('404');
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