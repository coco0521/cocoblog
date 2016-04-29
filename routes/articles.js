var express = require('express');
var models = require('../models');
var markdown = require('markdown').markdown;
var router = express.Router();
var auth = require('../middleware/auth');
var multer = require('multer');
//通过multer的diskStorage指定存储目录和文件名
var storage = multer.diskStorage({
    //目标路径
    destination: function (req, file, cb) {
        cb(null, '../public/upload')
    },
    //文件名
    filename: function (req, file, cb) {
        //fieldname originalname mimetype
        console.log(file);
        cb(null, Date.now()+'.'+(file.mimetype.slice(file.mimetype.indexOf('/')+1)));
    }
});
//这里面的upload是一个中间件，所以可以在router.post中用
var upload = multer({storage:storage});

router.get('/add',auth.checkLogin,function(req,res,next) {
    //因为add在edit里面传了article对象过去，这里也应该给一个空对象，不然报错
    res.render('article/add', {article:{}});
});
//通过upload.single('poster')得到req.file ,poster是表单中上传文件的name,通过upload.single已经把上传的图片保存到文件夹中
router.post('/add',auth.checkLogin,upload.single('poster'),function(req, res, next) {
    var article = req.body;
    var _id = article._id;
    if(_id){//有_id表示更新文章
        var updateObj = {title:article.title,content:article.content};
        if(req.file) {
            updateObj.poster = '/upload/' + req.file.filename;
        }
        models.Article.update({_id:_id},{$set:updateObj},function(err,result) {
            if(err){
                req.flash('error','文章更新失败！');
            }else{
                req.flash('success','文章更新成功！');
                res.redirect('/');
            }
        });
    }else{
        //req.file.filename就是图片的名字，需要把它存在poster中并保存到数据库
        if(req.file)
            article.poster = '/upload/'+req.file.filename;
        //把当前登录的用户的ID赋给user
        article.user = req.session.user._id;
        //保存文章到数据库
        models.Article.create(article,function(err,doc){
            if(err){
                req.flash('error','文章发表失败');
            }else{
                req.flash('success','文章发表成功');
                res.redirect('/');
            }
        });
    }
});

router.get('/detail/:_id',function(req,res){
    var _id = req.params._id;
    models.Article.update({_id:_id},{$inc:{pv:1}},function(err,result){
        models.Article.findById(_id).populate('user').populate('comments.user').exec(function(err,article){
            article.content = markdown.toHTML(article.content);
            res.render('article/detail',{article:article});
        })
    })

});

router.get('/delete/:_id',function(req,res) {
    var _id = req.params._id;
    models.Article.remove({_id:_id},function(err,result) {
        res.redirect('/');
    })
});

router.get('/edit/:_id',function(req,res){
    var _id = req.params._id;
    models.Article.findById(_id,function(err,article) {
        //编辑页面跟add页面类似,所以用add渲染
        res.render('article/add',{article:article});
    })
});

router.post('/comment',auth.checkLogin, function (req, res) {
    var user = req.session.user;
    models.Article.update({_id:req.body._id},{$push:{comments:{user:user._id,content:req.body.content}}},function(err,result){
        if(err){
            req.flash('error',err);
            return res.redirect('back');
        }
        req.flash('success', '评论成功!');
        res.redirect('back');
    });

});

module.exports = router;