var express = require('express');
var http = require("http");
var request1 = require("request");
var urlencode = require("urlencode");
var fs = require("fs");
var mongoClient = require("mongodb").MongoClient;
var GridFSBucket = require("mongodb").GridFSBucket;
var ObjectId = require("mongodb").ObjectId;
var uuid = require("uuid");
var multer = require("multer");


// var mongoose = require("mongoose");
// var conn = mongoose.createConnection("mongodb://106.12.28.10:27017/baidu_voice");
// conn.on("error",function(error){
//     console.log("数据库连接失败:"+error);
// });
// conn.on("open",function(){
//     console.log("数据库连接成功");
// });
// var gridfs = require("gridfs-stream");
// gridfs.mongo = mongoose.mongo;
// var gfs = gridfs(conn);
// var gridfs = require("gridfs-stream").GridFSBucket;
// var gridFS = require("GridFS");

// var AipSpeechClient = require("baidu-aip-sdk").speech;
// var HttpClient = require("baidu-aip-sdk").HttpClient;
var router = express.Router();
var img2word = require("../img2word/img2word.js");

var word2voice = require("../word2voice/word2voice");

var iconv = require('iconv-lite');
var upload = multer({dest: './public/filetext'});//设置上传文件存储地址
router.post('/uploadFile', upload.single('file'), function (req, res, next) {

    var ret = {};
    ret['code'] = 200;
    var file = req.file;
    if (file) {
        var fileNameArr = file.originalname.split('.');
        var suffix = fileNameArr[fileNameArr.length - 1];
        //文件重命名
        fs.renameSync('./public/filetext/' + file.filename,'./public/filetext/' + file.filename+"."+suffix);
        fs.readFile('./public/filetext/' + file.filename+"."+suffix,"binary",function(err,data){
            if(err){
                console.log("has error")
                return;
            }
            var buf = new Buffer(data, 'binary');
            var str = iconv.decode(buf, 'GBK');
            word2voice(str)
            fs.unlink('./public/filetext/' + file.filename,function(err,ret){
                if(err){
                    console.log("delete file failed")
                    return;
                }
                return "delete txt file success";
            })
        })
        file['newfilename'] = '${file.filename}.${suffix}';
    }
    ret['file'] = file;
    res.send(ret);
})

router.get("/clearAll", function (req, res, next) {
    var id = ObjectId(req.query.id);
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.remove({}, function (err, ret) {
                if (err) {
                    console.log("语音mongodb删除失败");
                    res.end("failed")
                }
                res.end("success");
            })
        }

    })
})

router.get("/deleteMongoDB", function (req, res, next) {
    var id = ObjectId(req.query.id);
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.remove({_id: id}, function (err, ret) {
                if (err) {
                    console.log("语音mongodb删除失败");
                    res.end("failed")
                }
                res.end("success");
            })
        }

    })
})

router.post("/baidu_api_down", function (req, res, next) {
    var response = res;
    if (req.body.content) {
        word2voice(req.body.content);
        res.end("success")
    }
    res.end("failed")
});

/* GET home page. */
router.get('/mp3_list', function (req, res, next) {
    var content = new Array("1", "2", "3", "4", "5")
    var page;
    if(req.query && req.query.index){
        page = parseInt(req.query.index);
    }else{
        page = 1
    }
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.find({}).sort({uploadDate: -1}).skip((page-1)*5).limit(5).toArray(function (err, ret) {
                if (err) {
                    console.log("query mongodb baidu_voice.mp3_list failed");
                } else {
                    res.render('sound-list', {title: 'sound-upload-transferword-to-mp3', content: ret});
                }
            })
        }

    })
});

/* GET home page. */
router.get('/mp3_list_count', function (req, res, next) {
    var content = new Array("1", "2", "3", "4", "5")
    if(req.query && req.query.index){
        page = parseInt(req.query.index);
    }else{
        page = 1
    }
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.count({},function(err,ret){
                if(err){
                    console.log("query count failed")
                }else{
                    res.json({
                        page:page,
                        total:ret
                    });
                }
            });
        }
    })
});

/* GET home page. */
router.get('/mp3_download', function (req, res, next) {
    var request = req;
    var response = res;
    var id = ObjectId(req.query.id);
    // var id = ObjectId('5cefbbd27a2d803bd0cbeb5f');
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {

            var db = connect.db("baidu_voice");
            var bucket = new GridFSBucket(db);
            db.collection("fs.files").find({_id: id}).toArray(function (err, ret) {
                if (err) {
                    console.log("mp3 file does not exist");
                } else {
                    var downloadStream = bucket.openDownloadStream(id);

                    res.writeHead(200, {
                        'Content-Type': 'application/force-download',
                        'Content-Disposition': 'attachment; filename=' + "alternative.mp3",
                        'Content-Length': ret[0].length
                    });
                    // var writeStream = fs.createWriteStream("test_feasible.mp3");
                    downloadStream.pipe(res);

                    // var fileName = 'test_feasible.mp3';
                    // var size = fs.statSync(fileName).size;
                    // var f = fs.createReadStream(fileName);
                    // res.writeHead(200, {
                    //     'Content-Type': 'audio/mpeg',
                    //     'Content-Disposition': 'attachment; filename=' + fileName,
                    //     'Content-Length': size
                    // });
                    // f.pipe(res);
                    // downloadStream.pipe(res);
                }
            })

        }

    })
});

router.get('/upload', function (req, res, next) {
    var content = new Array("1", "2", "3", "4", "5")
    res.render('sound-upload', {title: 'sound-upload-transferword-to-mp3', content: content});
})


router.get('/upload-content', function (req, res, next) {

    var originstr = "百度你好";
    var firstUrl = urlencode(originstr, "UTF-8");
    var secondUrl = urlencode(firstUrl, "UTF-8");

    var request2 = request1({
        url: "http://tsn.baidu.com/text2audio",
        method: 'POST',
        strictSSL: false,
        timeout: 1500,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: "tex=" + secondUrl + "&lan=zh&cuid=fe80514e2b609fbde162%7&ctp=1&aue=3&tok=24.4b5f49ced7e8431c6494adcf71b5bda6.2592000.1561210241.282335-16329044"
    }, function (err, res, body) {
        if (err) {
            console.log("baidu voice assemble failed")
        } else {
            console.log("start receive data");
        }

    });
    var fileData;
    request2.on('data', function (chunk) {
        // if(fileData){
        //     fileData += chunk;
        // }else{
        //     fileData = chunk
        // }
        fileData = chunk;
    });
    request2.on('end', function () {
        // var name = url.slice(url.lastIndexOf("/"));
        var fileName = "baidu_text_test.mp3";
        fs.writeFileSync(fileName, fileData);
        // fs.writeFile(fileName, fileData, "binary", function (err) {
        //     if (err) {
        //         console.log("[downloadPic]文件   " + fileName + "  下载失败.");
        //         console.log(err);
        //     } else {
        //         console.log("文件" + fileName + "下载成功");
        //     }
        // });
        // var path = './' + name;
        var size = fs.statSync(fileName).size;
        var f = fs.createReadStream(fileName);
        res.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-Disposition': 'attachment; filename=' + fileName,
            'Content-Length': size
        });
        f.pipe(res);
    });
    request2.on("error", function (err) {
        console.log(err);
    })
    // request.on("error",function(err){
    //     console.log("http connect failed")
    // })
    // request.write("tex=我是哪个&lan=zh&cuid=fe80514e2b609fbde162%7&ctp=1&aue=3&tok=24.4b5f49ced7e8431c6494adcf71b5bda6.2592000.1561210241.282335-16329044");
    // res.send("success")
})

module.exports = router;