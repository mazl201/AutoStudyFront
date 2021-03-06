var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var soundRouter = require('./routes/sound');
var move = require('./routes/move');
// var images = require("images");

var func = require("./img2word/img2word");


// var childProcess = require("child_process");
// var child = childProcess.fork("./word2voice/word2voicetest.js");
//
// child.on('message', function(m){
//     console.log('message from child: ' + JSON.stringify(m));
// });
//
// child.on("error",function(error){
//     console.log(error);
// })

// child.send({from: 'parent'});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

var body = require("body-parser");
app.use(body.urlencoded({extended:true}));

app.use(function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials","true");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(express.static(path.join(__dirname,"ueditor")));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sound', soundRouter);
app.use('/move', move);
var ueditor = require("ueditor");
app.use("/ueditor/getImg",ueditor(path.join(__dirname,"./public"),function(req,res,next){
    //客户端上传文件设置
    var imgDir = '/images/ueditor/'
    var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir;//默认图片上传地址
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/file/ueditor/'; //附件
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/video/ueditor/'; //视频
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');

        //压缩 文件
        func.scanCompression("./public/images/ueditor/");
        // func.scanDirectory("./public/images/compress/");

    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = imgDir;
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/php/config.json');
    }
}))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
