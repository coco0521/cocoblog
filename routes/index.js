var express = require('express');
var markdown = require('markdown').markdown;
var models = require('../models');
var router = express.Router();

/* GET home page. */
/**
* 分页 传参 当前页码 每页的条数
 * 结果 当页的数据 一共多少页
* */
router.get('/',function(req,res,next) {
  //处理搜索,得到点提交时url中的keyword和search字段内容，为了区分刷新和点提交时不同的情况
  var keyword = req.query.keyword;//取出查询关键字
  var search = req.query.search;//取出查询按钮
  var pageNum = parseInt(req.query.pageNum)||1;//当前页码
  var pageSize = parseInt(req.query.pageSize)||2;//每页有多少条数据

  var queryObj = {};
  //如果search有值 说明是点提交按钮过来的
  if(search) {
    //如果search有值，提交过来的，就把keyword存到session中
    req.session.keyword = keyword;
  }
  keyword = req.session.keyword;//keyword就从session中取就可以，这样做可以达到如果是点提交可以得到新的keyword,如果通过刷新是得到之前的keyword
  var reg = new RegExp(keyword,'i');
  //把查询字符串放到queryObj，通过title和content查询
  queryObj = {$or:[{title:reg},{content:reg}]};
  //得到所有的文章对象, 先查找，然后把user字符串转成user对象，这样可以找到user里面的avatar
  models.Article.find(queryObj).skip((pageNum-1)*pageSize).limit(pageSize).populate('user').exec(function(err,articles){
    articles.forEach(function(article){
      article.content = markdown.toHTML(article.content);
    });
    //取得queryObj这个条件有多少条符后的数据
    models.Article.count(queryObj,function(err,count){
      res.render('index',{
        articles:articles,
        totalPage:Math.ceil(count/pageSize),
        keyword:keyword,
        pageNum:pageNum,
        pageSize:pageSize
      });
    });
  });

  //在进入user/的时候，去检测session中是否有值,然后把它赋给user,通过session来判断显示的菜单，如果登录仅显示发表文章和退出，如果没有则全显示
  //var user = req.session.user;
  //如果session中没有值的时候user是undefineds,但这个每个页面都需要不可能挨个赋值，所以把它做为中间件传递
  //res.render('index',{title:'首页',user:user});

});


module.exports = router;
