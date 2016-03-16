/**
 * Created by MaoX on 2016/3/16.
 */
var Article = require('../models/article');
var Comment = require('../models/comments');

exports.post =function(req,res){
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
}