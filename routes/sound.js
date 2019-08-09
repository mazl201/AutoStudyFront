var express = require('express');
var http = require("http");
var request1 = require("request");
var urlencode = require("urlencode");
var crypto = require("crypto");
jschardet = require('jschardet');
var dateformat = require("dateformat");

var fs = require("fs");
var mongoClient = require("mongodb").MongoClient;
var GridFSBucket = require("mongodb").GridFSBucket;
var ObjectId = require("mongodb").ObjectId;
var uuid = require("uuid");
var multer = require("multer");
let PDFParser = require("pdf2json");


var func = require("../img2word/img2word");

//
// var convertpdftoIMGdemo = require("../pdf2png/convert-linux");
var dirExists = require("../utils/hasDir");
//导入图片拆分
var pdf2png = require("../pdf2png/pdf2png");
var projectPath = __dirname.split("\\");
projectPath.pop();
projectPath = projectPath.join("\\");
var gsPath = projectPath + "\\executables\\ghostScript";
console.log("current executable ghostScript path" + gsPath)
pdf2png.ghostscriptPath = gsPath;

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
var uploadTrans = multer({dest: './public/filetext'});//设置上传文件存储地址
router.post('/uploadFile', upload.single('file_data'), function (req, res, next) {

    var ret = {};
    ret['code'] = 200;
    var file = req.file;
    if (file) {
        var fileNameArr = file.originalname.split('.');
        var suffix = fileNameArr[fileNameArr.length - 1];
        if (suffix.toUpperCase().indexOf("TXT") > -1) {
            //文件重命名
            fs.renameSync('./public/filetext/' + file.filename, './public/filetext/' + file.filename + "." + suffix);
            fs.readFile('./public/filetext/' + file.filename + "." + suffix, "binary", function (err, data) {
                if (err) {
                    console.log("has error")
                    return;
                }

                var buf = new Buffer(data, 'binary');
                var txtContent = "";
                var txtContent = iconv.decode(buf, jschardet.detect(data).encoding);

                var originName = file.originalname.replace("." + suffix, "");
                // word2voice(str, 3, 4, originName);
                if (txtContent) {

                    let waitWord2VoideComplete = async function () {
                        spd = 3;
                        if (req.body.spd) {
                            spd = req.body.spd;
                        }

                        let word2voiceResult = await word2voice(txtContent, 3, 4, originName);
                        if (word2voiceResult == "success") {
                            file['newfilename'] = '${file.filename}.${suffix}';
                            ret['file'] = file;
                            ret['error'] = ""
                            res.send(ret);
                        } else {
                            ret['error'] = "文件为空,或者暂时不支持的文件类型."
                            res.send(ret);
                        }
                    }
                    waitWord2VoideComplete();
                } else {
                    ret['error'] = "文件为空,或者暂时不支持的文件类型."
                    res.send(ret);
                }
                fs.unlink('./public/filetext/' + file.filename + "." + suffix, function (err, ret) {
                    if (err) {
                        console.log("delete file failed")
                        return;
                    }
                    return "delete txt file success";
                })
            })

        } else if (suffix.toUpperCase().indexOf("PDF") > -1) {
            //文件重命名
            fs.renameSync('./public/filetext/' + file.filename, './public/filetext/' + file.filename + "." + suffix);

            if (dirExists("./public/pdf2imgsimg/") && dirExists("./public/filetext/")) {
                var time = (new Date()).getTime();
                pdf2png.convert("./public/filetext/" + file.filename + "." + suffix, function (resp) {
                    //
                    // if (!resp.success) {
                    //     console.log("Something went wrong: " + resp.error);
                    //     return;
                    // }
                    //
                    // fs.writeFile("./public/pdf2imgsimg/" + time + "-" + resp.number + ".png", resp.data, function (err) {
                    //     if (err) {
                    //         console.log(err);
                    //     }
                    //     console.log("transfer success");
                    //     // func.scanCompression("./public/pdf2imgsimg/");
                    // });
                    console.log("有一个文件转换成功")
                });
            }
            func.scanCompression("./public/pdf2imgsimg/");
            file['newfilename'] = '${file.filename}.${suffix}';
            ret['file'] = file;
            ret['error'] = "";
            res.send(ret);

            // var pdfParser = new PDFParser(this, 1);
            // pdfParser.loadPDF( './public/filetext/' + file.filename + "." + suffix);
            // pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
            // pdfParser.on("pdfParser_dataReady", pdfData => {
            //     data = pdfParser.getRawTextContent()
            // });
        }


    } else {
        ret['error'] = "文件为空,或者暂时不支持的文件类型."
        res.send(ret);
    }

})

router.post('/translateFile', uploadTrans.single('file'), function (req, res, next) {
    var file = req.file;
    if (file) {
        var fileNameArr = file.originalname.split('.');
        var suffix = fileNameArr[fileNameArr.length - 1];
        if (suffix.toUpperCase().indexOf("TXT") > -1) {
            //文件重命名
            fs.renameSync('./public/filetext/' + file.filename, './public/filetext/' + file.filename + "." + suffix);
            fs.readFile('./public/filetext/' + file.filename + "." + suffix, "binary", function (err, data) {
                if (err) {
                    console.log("has error")
                    return;
                }

                var buf = new Buffer(data, 'binary');
                var txtContent = "";
                var txtContent = iconv.decode(buf, jschardet.detect(data).encoding);

                var originName = file.originalname.replace("." + suffix, "");
                // word2voice(str, 3, 4, originName);
                if (txtContent) {

                    contentToTransfile(txtContent,res);
                } else {
                    res.end("failed");
                }
                fs.unlink('./public/filetext/' + file.filename + "." + suffix, function (err, ret) {
                    if (err) {
                        console.log("delete file failed")
                        return;
                    }
                    return "delete ready to transfer txt file success";
                })
            })
        }
    } else {
        res.end("empty");
    }

})

router.get("/clearAllImg", function (req, res, next) {
    if (req.query.id) {
        var arrIds = new Array();
        var splits = req.query.id.split(",");
        for (var jj in splits) {
            var split = splits[jj];
            if (split) {
                var objectId = ObjectId(split);
                arrIds.push(objectId);
            }

        }
        mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
            if (err) {
                console.log("mongodb connect failed");
            } else {
                var collection = connect.db("baidu_split_file").collection("fs.files");
                collection.find({_id: {$in: arrIds}}).toArray(function (err, ret) {
                    if (err) {
                        return
                    } else {
                        ret.forEach(function (retMp3) {
                            if (retMp3.fileImgPathId) {
                                collection.find({_id: retMp3.fileImgPathId}).toArray(function (err, retImg) {
                                    try {
                                        if (err) {
                                            console.log("can't find fs.files")
                                        } else {
                                            fs.unlink(retImg[0].path, function (err, result) {
                                                if (err) {
                                                    console.log("delete compress file again")
                                                } else {
                                                    console.log("delete compress file again success")
                                                }
                                            })
                                            collection.remove({_id: retImg[0]._id}, function (err, ret) {
                                                if (err) {
                                                    console.log("删除图片 文件 失败");
                                                    res.end("failed")
                                                }
                                                res.end("success");
                                            })
                                        }
                                    } catch (e) {
                                        console.log(e)
                                    }
                                })
                            }
                        })
                    }
                    if (arrIds.length == ret.length) {
                        collection.remove({_id: {$in: arrIds}}, function (err, ret) {
                            if (err) {
                                console.log("语音mongodb删除失败");
                                res.end("failed")
                            }
                            res.end("success");
                        })
                    }
                })

            }

        })
    }

})

router.post("/translate", function (req, res, next) {
    if (req.body && req.body.content) {
        var content = req.body.content;

        async function waitTranslateComplete(){
            let translateContent = await baiduTranslateMet(content);
            res.end("<ul class=\"tab-p-modal\" size='5'>"+translateContent+"</ul><ul class='tab-p-modal-origin' size='4'>"+content+"</ul>");
        }
        waitTranslateComplete();
    }
})

router.post("/translateLayer", function (req, res, next) {
    if (req.body && req.body.content) {
        var content = req.body.content;

        async function waitTranslateComplete(){
            let translateContent = await baiduTranslateMet(content);
            res.end(translateContent+"<br>"+content);
        }
        waitTranslateComplete();
    }
})

router.post("/translateDsttranslateDst", function (req, res, next) {
    if (req.body && req.body.content) {
        var content = req.body.content;
        let waitTranslate = async function () {
            let translateContent = await baiduTranslateMet(content);
            if (translateContent) {
                res.end(translateContent);
            } else {
                res.end("")
            }
        }
        waitTranslate();
    } else {
        res.end("内容为空。")
    }

})

function baiduTranslateMet(content) {
    // var content = req.body.word;
    return new Promise(function (resolveTrans, rejectTrans) {
        if (content) {
            crypto.randomBytes(16, function (ex, buf) {
                if (ex) throw ex;
                var salt = buf.toString('hex');
                var appid = '20190626000310542';
                content = content.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
                // 去掉特殊字符
                content = content.replace(/[\@\#\$\%\^\&\*\(\)\{\}\:\"\L\<\>\?\[\]]/, "");
                content = content.replace(/\s+/g, "");
                var md5 = crypto.createHash("md5");
                var sign = md5.update(appid + content + salt + 'oxAgDeBYrc8xDwCyzXvs').digest('hex');


                var request2 = request1({
                    url: "http://api.fanyi.baidu.com/api/trans/vip/language?" + "q=" + urlencode(content, "UTF-8") + "&appid=20190626000310542&salt=" + salt + "&sign=" + sign,
                    method: 'GET',
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                }, function (err, response, body) {
                    if (err) {
                        resolveTrans("error in baidu api");
                        console.log("baidu translate language failed")
                    } else {
                        try {

                            if (body && eval("(" + body + ")").data) {
                                console.log("baidu translate language received");
                                var from = "";
                                var to = "";
                                if (eval("(" + body + ")").data.src == "en") {
                                    from = "en";
                                    to = "cn"
                                } else if (eval("(" + body + ")").data.src == "zh") {
                                    from = "zh";
                                    to = "en";
                                } else {
                                    resolveTrans("Error language identified")
                                    return;
                                }

                                var requestTO = request1({
                                    url: "http://api.fanyi.baidu.com/api/trans/vip/translate?" + "q=" + urlencode(content, "UTF-8") + "&from=" + from + "&to=" + to + "&appid=20190626000310542&salt=" + salt + "&sign=" + sign,
                                    method: 'GET',
                                    timeout: 10000,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                }, function (err, response, body) {
                                    if (err) {
                                        resolveTrans("error in baidu api");
                                        console.log("baidu translate failed")
                                    } else {
                                        try {
                                            console.log("start receive translate result");
                                            if (body && eval("(" + body + ")").trans_result && eval("(" + body + ")").trans_result.length > 0) {
                                                // res.end(eval("(" + body + ")").trans_result[0].dst);
                                                resolveTrans(eval("(" + body + ")").trans_result[0].dst);
                                            } else {
                                                resolveTrans("null")
                                            }
                                        } catch (e) {
                                            resolveTrans("error in baidu api");
                                            console.log("返回结果，取不到对应值");
                                        }
                                    }
                                });

                                requestTO.on("end", function (data) {
                                    console.log("log started ")
                                })
                            } else {
                                resolveTrans("can't recoginize which language");
                                console.log("can't recoginize which language");
                            }
                        } catch (e) {
                            resolveTrans("error in baidu api");
                            console.log("返回结果，取不到对应值");
                        }
                    }
                });

                request2.on("end", function (data) {
                    console.log("log started ")
                })
            });
        } else {
            resolveTrans("null");
        }

    })

}

router.post("/translateEnEn", function (req, res, next) {
    if (req.body && req.body.word) {
        async function translateToEn(){
            let promise = await baiduTranslateMet(req, res);
            if(promise){
                res.end(promise);
            }
        }
        translateToEn();

    }
})

router.get("/deleteMongoDBImg", function (req, res, next) {
    var id = ObjectId(req.query.id);
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_split_file").collection("fs.files");
            collection.find({_id: id}).toArray(function (err, ret) {
                if (err) {
                    console.log("can't find fs.files")
                } else {

                    collection.remove({_id: id}, function (err, ret) {
                        if (err) {
                            console.log("语音mongodb删除失败");
                            res.end("failed")
                        }
                        res.end("success");
                    })
                }
            })

        }

    })
})

router.get("/clearAll", function (req, res, next) {
    if (req.query.id) {
        var arrIds = new Array();
        var splits = req.query.id.split(",");
        for (var jj in splits) {
            var split = splits[jj];
            if (split) {
                var objectId = ObjectId(split);
                arrIds.push(objectId);
            }

        }
        mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
            if (err) {
                console.log("mongodb connect failed");
            } else {
                var collection = connect.db("baidu_voice").collection("fs.files");
                collection.find({_id: {$in: arrIds}}).toArray(function (err, ret) {
                    if (err) {
                        return
                    } else {
                        ret.forEach(function (retMp3) {
                            if (retMp3.fileImgPathId) {
                                collection.find({_id: retMp3.fileImgPathId}).toArray(function (err, retImg) {
                                    try {
                                        if (err) {
                                            console.log("can't find fs.files")
                                        } else {
                                            // fs.unlink(retImg[0].path, function (err, result) {
                                            //     if (err) {
                                            //         console.log("delete compress file again")
                                            //     } else {
                                            //         console.log("delete compress file again success")
                                            //     }
                                            // })
                                            collection.remove({_id: retImg[0]._id}, function (err, ret) {
                                                if (err) {
                                                    console.log("删除图片 文件 失败");
                                                    res.end("failed")
                                                }
                                                res.end("success");
                                            })
                                        }
                                    } catch (e) {
                                        console.log(e)
                                    }
                                })
                            }
                        })
                    }
                    if (arrIds.length == ret.length) {
                        collection.remove({_id: {$in: arrIds}}, function (err, ret) {
                            if (err) {
                                console.log("语音mongodb删除失败");
                                res.end("failed")
                            }
                            res.end("success");
                        })
                    }
                })

            }

        })
    }

})

router.get("/deleteMongoDB", function (req, res, next) {
    var id = ObjectId(req.query.id);
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.find({_id: id}).toArray(function (err, ret) {
                if (err) {
                    console.log("can't find fs.files")
                } else {
                    try {
                        if (ret[0].fileImgPathId) {
                            collection.find({_id: ret[0].fileImgPathId}).toArray(function (err, retImg) {
                                try {
                                    if (err) {
                                        console.log("can't find fs.files")
                                    } else {
                                        fs.unlink(retImg[0].path, function (err, result) {
                                            if (err) {
                                                console.log("delete compress file again")
                                            } else {
                                                console.log("delete compress file again success")
                                            }
                                        })
                                        collection.remove({_id: retImg[0]._id}, function (err, ret) {
                                            if (err) {
                                                console.log("删除图片 文件 失败");
                                                res.end("failed")
                                            }
                                            res.end("success");
                                        })
                                    }
                                } catch (e) {
                                    console.log(e)
                                }
                            })
                        }


                        collection.remove({_id: id}, function (err, ret) {
                            if (err) {
                                console.log("语音mongodb删除失败");
                                res.end("failed")
                            }
                            res.end("success");
                        })
                    } catch (e) {
                        console.log("同时删除 file img 失败");
                    }
                }
            })

        }

    })
})

router.post("/baidu_api_down", function (req, res, next) {
    var response = res;
    if (req.body.content) {
        var content = req.body.content;

        let waitWord2VoideComplete = async function () {

            let word2voiceResult = await word2voice(req.body.content, req.body.spd, req.body.per,dateformat(new Date(),"yyyymmdd"));
            if (word2voiceResult == "success") {
                res.end("success");
            }
            res.end("failed");
        }
        waitWord2VoideComplete();
    } else {
        res.end("failed");
    }
});

function contentToTransfile(content, res) {
    content.replace("\\n", "");
    let contents = content.split(/[.!\?。？！]/);

    var index = 0;

    // const bufFile = Buffer.alloc(content.length * 3);
    let writeFile = ""
    let waitSentenceOneByOne = async function () {
        var sentence = contents[index];
        console.log("start translate " + index + "**********" + sentence);
        let translateResult = await baiduTranslateMet(sentence);
        if (translateResult && index < contents.length) {
            writeFile = writeFile + translateResult + "->" + sentence + ".";
            index = index + 1;
            waitSentenceOneByOne()
            // waitSentenceOneByOne()
        }
        if (index == contents.length) {
            let fileName = (new Date()).getTime() + ".txt";

            fs.writeFileSync(fileName, writeFile);

            res.end("success" + fileName)
            return;
        }
    }
    waitSentenceOneByOne();
}

router.post("/en_cn_trans", function (req, res, next) {
    if (req.body.content) {
        let content = req.body.content;
        contentToTransfile(content, res);
    }
})

router.get("/downloadTxt", function (req, res, next) {
    if (req.query.path) {
        var downloadStream = fs.createReadStream(req.query.path);

        res.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-Disposition': 'attachment; filename=' + req.query.path
            // 'Content-Length':
        });
        downloadStream.pipe(res);
        downloadStream.on("end",function(){
            fs.unlinkSync(req.query.path);
        })

    }
})

router.post("/retry_baidu_api_down", function (req, res, next) {
    var response = res;
    if (req.body.content) {
        function callBack(id) {
            res.end(id.toString())
        }

        var filename = req.body.filename.trim().split(/\s+/g)[0];
        if (filename.indexOf("item") > -1) {
            filename = filename.split("item")[0]
        }
        word2voice(req.body.content, 3, 3, filename, 1, null, callBack);
    }
});

/* GET home page. */
router.get('/img_list', function (req, res, next) {
    var content = new Array("1", "2", "3", "4", "5")
    var pageIndex;
    if (req.query && req.query.index) {
        pageIndex = parseInt(req.query.index);
    } else {
        pageIndex = 1
    }
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_split_file").collection("fs.files");
            collection.find({}).sort({filename: 1}).skip((pageIndex - 1) * 10).limit(10).toArray(function (err, ret) {
                if (err) {
                    console.log("query mongodb baidu_voice.img_list failed");
                } else {
                    res.render('img-list', {title: 'sound-upload-transferword-to-mp3', content: ret});
                }
            })
        }

    })
});

/* GET home page. */
router.get('/img_download', function (req, res, next) {
    var request = req;
    var response = res;
    var id = ObjectId(req.query.id);
    // var id = ObjectId('5cefbbd27a2d803bd0cbeb5f');
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {

            var db = connect.db("baidu_split_file");
            var bucket = new GridFSBucket(db);
            db.collection("fs.files").find({_id: id}).toArray(function (err, ret) {
                try {
                    if (err) {
                        console.log("mp3 file does not exist");
                    } else {
                        var downloadStream = bucket.openDownloadStream(id);

                        res.writeHead(200, {
                            'Content-Type': 'application/force-download',
                            'Content-Disposition': 'attachment; filename=' + urlencode(ret[0].filename, "UTF-8"),
                            'Content-Length': ret[0].length
                        });
                        downloadStream.pipe(res);


                    }
                } catch (e) {
                    console.log(e);
                }
            })

        }
    })
});

/* GET home page. */
router.get('/img_download_big', function (req, res, next) {
    var request = req;
    var response = res;
    var id = ObjectId(req.query.id);
    // var id = ObjectId('5cefbbd27a2d803bd0cbeb5f');
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {

            var db = connect.db("baidu_split_file");
            var bucket = new GridFSBucket(db);
            db.collection("fs.files").find({_id: id}).toArray(function (err, ret) {
                try {
                    if (err) {
                        console.log("mp3 file does not exist");
                    } else {
                        var downloadStream = bucket.openDownloadStream(id);

                        res.writeHead(200, {
                            'Content-Type': 'application/force-download',
                            'Content-Disposition': 'attachment; filename=' + urlencode(ret[0].filename, "UTF-8"),
                            'Content-Length': ret[0].length
                        });
                        downloadStream.pipe(res);


                    }
                } catch (e) {
                    console.log(e);
                }
            })

        }
    })
});


/* GET home page. */
router.get('/img_list_count', function (req, res, next) {
    var content = new Array("1", "2", "3", "4", "5")
    if (req.query && req.query.index) {
        page = parseInt(req.query.index);
    } else {
        page = 1
    }
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_split_file").collection("fs.files");
            collection.count({}, function (err, ret) {
                if (err) {
                    console.log("query count failed")
                } else {
                    res.json({
                        page: page,
                        total: ret
                    });
                }
            });
        }
    })
});

/* GET home page. */
router.get('/mp3_list', function (req, res, next) {
    var content = new Array("1", "2", "3", "4", "5")
    var pageIndex;
    var fileName = "";
    if (req.query && req.query.fileName) {
        fileName = req.query.fileName;
    }
    if (req.query && req.query.index) {
        pageIndex = parseInt(req.query.index);
    } else {
        pageIndex = 1
    }
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.find({
                content: {$ne: null},
                "fileImgPathId": null,
                originFileName: fileName
            }).sort({filename: 1}).skip((pageIndex - 1) * 5).limit(5).toArray(function (err, ret) {
                if (err) {
                    console.log("query mongodb baidu_voice.mp3_list failed");
                } else {
                    ret.forEach(function (retSingle) {
                        if (retSingle.filename && retSingle.filename.indexOf("mp3") > -1) {
                            retSingle.isMp3 = true;
                        } else {
                            retSingle.isMp3 = false;
                        }
                    })
                    res.render('sound-list', {title: 'sound-upload-transferword-to-mp3', content: ret});
                }
            })
        }
    })
});

/* GET home page. */
router.get('/mp3_img', function (req, res, next) {
    var content = new Array("1", "2", "3", "4", "5")
    var pageIndex;
    if (req.query && req.query.index) {
        pageIndex = parseInt(req.query.index);
    } else {
        pageIndex = 1
    }
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.find({
                content: {$ne: null},
                "fileImgPathId": {$ne: null}
            }).sort({filename: 1}).skip((pageIndex - 1) * 5).limit(5).toArray(function (err, ret) {
                if (err) {
                    console.log("query mongodb baidu_voice.mp3_list failed");
                } else {
                    ret.forEach(function (retSingle) {
                        if (retSingle.filename && retSingle.filename.indexOf("mp3") > -1) {
                            retSingle.isMp3 = true;
                        } else {
                            retSingle.isMp3 = false;
                        }
                    })
                    res.render('sound-img', {title: 'sound-upload-transferword-to-mp3', content: ret});
                }
            })
        }
    })
});

/* GET home page. */
router.get('/', function (req, res, next) {
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.aggregate({"$group": {_id: "$originFileName", countss: {$sum: 1}}}, function (err, ret) {
                if (err) {
                    console.log("query mongodb baidu_voice.mp3_list failed");
                } else {
                    var array = new Array();

                    // ret.each(function(err,item){
                    //     array.add(item);
                    // })
                    ret.toArray(function (err, items) {
                        console.log("count: " + items.length);
                        res.render('tabView', {title: '解放你的双手', content: items});
                    });

                }
            })
        }

    })

});

/* GET home page. */
router.get('/mp3_list_count', function (req, res, next) {
    var content = new Array("1", "2", "3", "4", "5")
    if (req.query && req.query.index) {
        page = parseInt(req.query.index);
    } else {
        page = 1
    }
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.count({content: {$ne: null}, "fileImgPathId": null}, function (err, ret) {
                if (err) {
                    console.log("query count failed")
                } else {
                    res.json({
                        page: page,
                        total: ret
                    });
                }
            });
        }
    })
});

/* GET home page. */
router.get('/mp3_img_count', function (req, res, next) {
    var content = new Array("1", "2", "3", "4", "5")
    if (req.query && req.query.index) {
        page = parseInt(req.query.index);
    } else {
        page = 1
    }
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, connect) {
        if (err) {
            console.log("mongodb connect failed");
        } else {
            var collection = connect.db("baidu_voice").collection("fs.files");
            collection.count({content: {$ne: null}, "fileImgPathId": {$ne: null}}, function (err, ret) {
                if (err) {
                    console.log("query count failed")
                } else {
                    res.json({
                        page: page,
                        total: ret
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
                try {
                    if (err) {
                        console.log("mp3 file does not exist");
                    } else {
                        var downloadStream = bucket.openDownloadStream(id);

                        let str = ret[0].filename;
                        if (!str) {
                            str = "noName.mp3"
                        }
                        res.writeHead(200, {
                            'Content-Type': 'application/force-download',
                            'Content-Disposition': 'attachment; filename=' + urlencode(str, "UTF-8"),
                            'Content-Length': ret[0].length
                        });
                        downloadStream.pipe(res);


                    }
                } catch (e) {
                    res.end("failed")
                    console.log(e);
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