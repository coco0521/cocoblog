var express = require('express');
var router = express.Router();
var util = require('../util');
var auth = require('../middleware/auth');
//通过模型访问数据库
var models = require('../models');

/**
 * 用户注册
 * 在get，post等可以传入中间件函数，如果可满足，那么next即为res.render....
 */
router.get('/reg',auth.checkNotLogin,function(req, res, next) {
  res.render('user/reg', { title: '注册' });
});
/**
 * 当填写用户注册信息提交时的处理
 */
router.post('/reg',auth.checkNotLogin,function(req, res) {
  //判断当密码与确认密码不同的情况
  var user = req.body;
  if(user.password != user.repassword) {
    res.redirect('back');
  }else{
    req.body.password = util.md5(req.body.password);
    //通过avatar的地址可以找到该用户的头像，头像是跟邮箱地址相关联的
    req.body.avatar = 'https://secure.gravatar.com/avatar/'+util.md5(req.body.email)+'?s=48';
    //保存对象有两种 model.create, entity.save
    //req.body传递过来的是用户名和邮箱的json数据，通过model的save方法保存
    models.User.create(req.body, function(err,doc) {
      if(err) {
        req.flash('error','用户注册失败！');
      }else{
        //console.log(doc);
        req.flash('success','用户注册成功！');
        res.redirect('/users/login');//302 Location
      }
    });
  }
});
/**
 * 显示用户登录表单
 */
router.get('/login',auth.checkNotLogin,function(req, res, next) {
  res.render('user/login', { title: '登录' });
});
/**
 * 当填写用户登录信息提交时的处理
 */
router.post('/login',auth.checkNotLogin,function(req, res) {
  req.body.password = util.md5(req.body.password);
  //数据库中查找一次就可以，不需要用find
  models.User.findOne({username:req.body.username,password:req.body.password},function(err,doc) {
    if(err){
      req.flash('error','用户登录失败！');
      //如果出错，还是跳转到登录页面
      res.redirect('back');
    }else{
      if(doc){//如果有值表示找到了对应的用户，表示登录成功了
        //登录成功之后把查询到的user用户赋给session的user属性
        req.session.user = doc;
        //跳转成功之后给一个提示
        req.flash('success','用户登录成功！');
        //检验doc中有值才表示真正成功，跳转到首页
        res.redirect('/');
      }else{//找不到，登录失败了
        req.flash('error','用户登录失败！');
        res.redirect('back');
      }
    }
  })
});
/**
 * 退出
 */
router.get('/logout',auth.checkLogin,function(req, res, next) {
  //退出的时候需要清空session
  req.session.user = null;
  req.flash('success','用户退出成功！');
  res.redirect('/');
});

module.exports = router;
