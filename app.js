var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var articles = require('./routes/articles');
//引入session中间件 req.session，用来存session的
var session = require('express-session');
//默认情况下,session是存放在内存中的，connect-mongo会把session存在数据库
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');

var app = express();
app.set('env',process.env.ENV);
var config = require('./config');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//bodyParser.json以及urlencoded不能处理enctype为multipart/form-data的多块form数据，如文件上传图片上传，就不能放在body上面去，而multer就是用来处理这种情况的
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//因为session是引入了cookie的，所以在cookie之后才能use
app.use(session({
  //加密字符串
  secret:'coco',
  //每次响应结束后都保存一下session数据
  resave:true,
  //保存新创建但未初始化的session
  saveUninitialized:true,
  //存储session的位置
  store: new MongoStore({
    url:config.dbUrl
  })
}));
//flash是依赖session的，所以放在session的后面。
app.use(flash());
app.use(function(req,res,next) {
  //res.locals才是真正的渲染模板的对象，如存放的title，最终是存放在res.locals,这样每页都能访问到user了
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  //把存到session中的关键字放在locals中，这样每个页都能访问到keyword
  res.locals.keyword = req.session.keyword;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/articles', articles);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
