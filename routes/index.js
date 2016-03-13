/**
 * Created by MaoX on 2016/3/9.
 */
var crypto = require('crypto');
var User = require('../models/user');
var multer = require('multer');//文件上传
var Article = require('../models/article');
var Comment = require('../models/comments');

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

            var page ={};
            page.p = parseInt(req.query.p) || 0;
            page.s = 10;
            Article.count({author:user.name},function(err,total){
                if(err){
                    return res.send(err);
                }
                page.max = Math.ceil(total/page.s);
                Article.find({author:user.name}).skip(page.p*page.s).limit(page.s).sort('-meta.createAt').exec(function(err,articles){
                    if(err){
                        articles =[];
                    }
                    res.render('index',{
                        title:user.name,
                        user:req.session.user,
                        success:req.flash('success').toString(),
                        error:req.flash('error').toString(),
                        articles:articles,
                        page:page
                    });
                });
            });
        });
    });


    app.get('/article/:id',function(req,res){
        Article.findByIdAndUpdate(req.params.id,{$inc:{pv:1}})
            .populate('comments')
            .exec(function(err,article){
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

    app.get('/article/:id/edit',checkLogin,function(req,res){
        Article.findById(req.params.id,function(err,article){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('edit',{
                title:'编辑',
                article:article,
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            })
        })
    });

    app.post('/article/:id/edit',checkLogin,function(req,res){
        var _article = req.body.article;
        Article.findById(req.params.id,function(err,article){
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            if(!article){
                req.flash('error','文章不存在！');
                return res.redirect('back');
            }
            article.title = _article.title;
            article.content = _article.content;
            article.tags = _article.tags;
            article.save(function(err){
                if(err){
                    req.flash('error',err);
                    return res.redirect('back');
                }
                res.redirect('/');
            })
        });
    });

    app.get('/article/:id/remove',checkLogin,function(req,res){
        Article.remove({_id:req.params.id},function(err,article){
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success','删除成功！');
            res.redirect('/');
        })
    });

    app.post('/article/:id/comment',checkLogin,function(req,res){
        Article.findById(req.params.id,function(err,article){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            if(!article){
                req.flash('error','文章不存在');
                return res.redirect('/');
            }
            var comment = new Comment({
                content:req.body.content,
                from:req.session.user.name
            });

            comment.save(function(err,comment){
                if(err){
                    req.flash('error',err);
                    return res.redirect();
                }
                article.comments.push(comment);
                article.save(function(err){
                    if(err){
                        req.flash('error',err);
                        return res.redirect();
                    }
                    req.flash('success','提交成功！');
                    return res.redirect('back');
                });
            });
        });
    });

    app.get('/archive',function(req,res){

        Article.find({}).select("_id meta title").sort('-meta.createAt').exec(function(err,articles){
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            res.render('archive',{
                title:'存档',
                articles:articles,
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            })
        });
    });

    app.get('/tags',function(req,res){
        Article.getTags(function(err,tags){
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            res.render('tags',{
                title:'标签',
                tags:tags,
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });
        });
    });

    app.get('/tags/:tag',function(req,res){
        Article.find({tags:req.params.tag}).select('title meta').sort('-meta.createAt')
            .exec(function(err,articles){
                if(err){
                    req.flash('error',err);
                    return res.redirect('back');
                }
                res.render('tag',{
                    title:'TAG:'+req.params.tag,
                    articles:articles,
                    user:req.session.user,
                    success:req.flash('success').toString(),
                    error:req.flash('error').toString()
                });
            });
    });

    app.get('/search',function(req,res){
        var pattern = new RegExp(req.query.keyword.trim(),'i');
        Article.find({title:pattern}).select('title meta').sort('-meta.createAt')
            .exec(function(err,articles){
                if(err){
                    req.flash('error',err);
                    return res.redirect('back');
                }
                res.render('search',{
                    title:'SEARCH:'+req.query.keyword,
                    articles:articles,
                    user:req.session.user,
                    success:req.flash('success').toString(),
                    error:req.flash('error').toString()
                });
            });
    });

    app.get('/links',function(req,res){
        res.render('links',{
            title:'友情链接',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

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