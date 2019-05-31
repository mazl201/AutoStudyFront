var express = require('express');
var http = require("http");
var request1 = require("request");
var urlencode = require("urlencode");
var fs = require("fs");
var mongoClient = require("mongodb").MongoClient;
var GridFSBucket = require("mongodb").GridFSBucket;
var ObjectId = require("mongodb").ObjectId;
var uuid = require("uuid");


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

var AipSpeechClient = require("baidu-aip-sdk").speech;
var HttpClient = require("baidu-aip-sdk").HttpClient;
var router = express.Router();

//设置 client
var client = new AipSpeechClient("16329044", "um4CpIw5abD8si05UUU7bGOg", "TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w");
//设置 百度 访问 request
HttpClient.setRequestInterceptor(function (requestOptions) {

    console.log(requestOptions);

    requestOptions.timeout = 5000;

    return requestOptions;
})


router.post("/baidu_api_down", function (req, res, next) {
    var response = res;
    if (req.body.content) {
        var length = req.body.content.length;
        var splits = new Array();
        if (length > 2048) {
            //0 2048
            for (var index = 0; index < length; index += 2048) {
                if ((index + 2048) < length) {
                    var str = req.body.content.substring(index, index + 2048);
                    splits.push(str)
                } else {
                    var str = req.body.content.substring(index, length);
                    splits.push(str);
                }
            }
        } else {
            splits.push(req.body.content);
        }
        splits.forEach(function (splitConten, index) {
            client.text2audio(splitConten).then(function (result) {
                if (result.data) {
                    var uuid1 = uuid()+".mp3";
                    fs.writeFileSync(uuid1, result.data);
                    return uuid1;
                } else {
                    console.log(result);
                }
            }, function (e) {
                console.log(e);
            }).then(function (path) {
                var path = path;
                console.log("test log chain")
                mongoClient.connect("mongodb://106.12.28.10:27017", function (err, conn) {
                    if(path){
                        var db = conn.db("baidu_voice");
                        var gridFSdb = new GridFSBucket(db);
                        var fileReadStream = fs.createReadStream(path);

                        var openUploadStream = gridFSdb.openUploadStream(path);

                        var license = fs.readFileSync(path);
                        var id = openUploadStream.id;


                        openUploadStream.once('finish', function () {

                            var chunksColl = db.collection('fs.files');
                            var chunksQuery = chunksColl.find({_id: id});

                            // var gridFSBucketReadStream = gridFSdb.openDownloadStream(id);
                            // var testDat = gridFSdb.openUploadStream("testid.dat");
                            // gridFSBucketReadStream.pipe(testDat);

                            chunksQuery.toArray(function (err, ret) {
                                if (err) {
                                    console.log("can't find file")
                                } else {
                                    fs.unlink(path,function(err){
                                        if(!err){
                                            console.log("删除临时文件成功");
                                        }
                                    })
                                }
                            })
                            console.log("mp3 ")

                            // Get all the chunks
                            // chunksQuery.toArray(function (error, docs) {
                            //     test.equal(error, null);
                            //     test.equal(docs.length, 1);
                            //     test.equal(docs[0].data.toString('hex'), license.toString('hex'));
                            //
                            //     var filesColl = db.collection('fs.files');
                            //     var filesQuery = filesColl.find({_id: id});
                            //     filesQuery.toArray(function (error, docs) {
                            //         test.equal(error, null);
                            //         test.equal(docs.length, 1);
                            //
                            //         var hash = crypto.createHash('md5');
                            //         hash.update(license);
                            //         test.equal(docs[0].md5, hash.digest('hex'));
                            //
                            //         // make sure we created indexes
                            //         filesColl.listIndexes().toArray(function (error, indexes) {
                            //             test.equal(error, null);
                            //             test.equal(indexes.length, 2);
                            //             test.equal(indexes[1].name, 'filename_1_uploadDate_1');
                            //
                            //             chunksColl.listIndexes().toArray(function (error, indexes) {
                            //                 test.equal(error, null);
                            //                 test.equal(indexes.length, 2);
                            //                 test.equal(indexes[1].name, 'files_id_1_n_1');
                            //             });
                            //         });
                            //     });
                            // });
                        })

                        fileReadStream.pipe(openUploadStream);
                    }

                })
            })
        });
        res.end("success")
    }
    res.end("failed")
});

/* GET home page. */
router.get('/mp3_list', function (req, res, next) {
    var content = new Array("1", "2", "3", "4", "5")

    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.find({}).sort({uploadDate: -1}).toArray(function (err, ret) {
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