/**
 * Created by MaoX on 2016/3/16.
 */
var Article = require('../models/article');
var Comment = require('../models/comments');
var User = require('../models/user');
exports.showPost = function(req,res){
    res.render('post',{
        title:'发表',
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    });
};

exports.post =function(req,res){

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
};

exports.getByUser =function(req,res){
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
};

exports.getById =function(req,res){
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
};

exports.showEdit =function(req,res){
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
};

exports.edit = function(req,res){
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
};

exports.remove =function(req,res){
    Article.findByIdAndRemove(req.params.id,function(err,article){
        if(err){
            req.flash('error',err);
            return res.redirect('/');
        }
        console.log(article);
        if(!article.reprint.from){
            req.flash('success','删除成功！');
            return res.redirect('/');
        }
        Article.findByIdAndUpdate(article.reprint.from,{$pull: {'reprint.to':article._id}},function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','删除成功！');
            return res.redirect('/');
        })
    })
};

exports.reprint=function(req,res){
    Article.reprint(req.params.id,req.session.user.name,function(err,article){
        if(err){
            req.flash('error',err);
            console.log(err);
            return res.redirect('back');
        }
        req.flash('success','转载成功！');
        res.redirect('/article/'+article._id);
    })
};

exports.archive = function(req,res){

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
};

exports.tags = function(req,res){
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
};

exports.getByTag = function(req,res){
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
};

exports.search =function(req,res){
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
};