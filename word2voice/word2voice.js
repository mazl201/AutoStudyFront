var mongoClient = require("mongodb").MongoClient;
var GridFSBucket = require("mongodb").GridFSBucket;
var AipSpeechClient = require("baidu-aip-sdk").speech;
var HttpClient = require("baidu-aip-sdk").HttpClient;
var uuid = require("uuid");
var fs = require("fs");
//加载redis
var redisClient = require("../utils/redis");
var sendMsg = require("../kafkautils/kafka-producer");
var require1 = require("../kafkautils/kafka-consumer");
var dateformat = require("dateformat");
var dirExists = require("../utils/hasDir");


//设置 client
var client = new AipSpeechClient("16329044", "um4CpIw5abD8si05UUU7bGOg", "TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w");
//设置 百度 访问 request
HttpClient.setRequestInterceptor(function (requestOptions) {

    // console.log(requestOptions);
    console.log("start word 2 voice ")
    requestOptions.timeout = 10000;

    return requestOptions;
})

function word2pdf() {

}


function pad(num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}

function failedTxtPathImg2Mongodb(pathImg, db, chunksColl, id,resolveVoice) {
//插入 上传图片
    if (pathImg) {
        fs.stat(pathImg, function (err, res) {
            if (err) {
                console.log(err);
                return;
            }
            var gridFSdb1 = new GridFSBucket(db);
            var fileReadStream1 = fs.createReadStream(pathImg);
            var openUploadStream1 = gridFSdb1.openUploadStream(pathImg);

            var license = fs.readFileSync(pathImg);
            var idImg = openUploadStream1.id;
            openUploadStream1.once('finish', function () {
                chunksColl.update({_id: id}, {
                    $set: {
                        fileImgPathId: idImg,
                        path: pathImg
                    }
                }, function (err, result) {
                    resolveVoice("success");
                    console.log(result);
                })

                fs.unlink(pathImg, function (err, result) {
                    if (err) {
                        console.log("delete compress image file failed")
                        return;
                    }
                    return "delete  compress image file success";
                })
            })
            fileReadStream1.pipe(openUploadStream1)
        })
        return 1;
    }else {
        return 0;
    }
}

function pathImgFailedTxtUpload(pathTxt, fileName, pathImg, originContent, resolveVoice) {
    if (pathTxt) {
        mongoClient.connect("mongodb://106.12.28.10:27017", function (err, conn) {
            var db = conn.db("baidu_voice");
            var gridFSdb = new GridFSBucket(db);
            var fileReadStream = fs.createReadStream(pathTxt);
            var openUploadStream = gridFSdb.openUploadStream(pathTxt);

            var license = fs.readFileSync(pathTxt);
            var id = openUploadStream.id;

            openUploadStream.once("finish", function () {

                var chunksColl = db.collection('fs.files');
                var chunksQuery = chunksColl.find({_id: id});
                chunksQuery.toArray(function (err, ret) {
                    if (err) {
                        console.log("未能成功保存到数据库");
                        // fs.unlink(pathTxt,function(err,ret){
                        //     console.log("未能成功保存到数据库,删除txt文件");
                        // })
                    }
                    if (!err) {
                        fs.unlink(pathTxt, function (err, result) {
                            if (err) {
                                console.log("delete compress txt file failed")
                                return;
                            }
                            return "delete  compress txt file success";
                        })
                        chunksColl.update({_id: id}, {
                            $set: {
                                filename: fileName + ".txt",
                                "content": originContent,
                                "originFileName": fileName
                            }
                        }, function (err, result) {
                            console.log(result);
                        })
                        if (failedTxtPathImg2Mongodb(pathImg, db, chunksColl, id,resolveVoice) == 1){

                        }else{
                            resolveVoice("success");
                        }
                    }
                })

            })

            fileReadStream.pipe(openUploadStream);
        })
    }
}

function saveImgToMongodbIfHave(db, chunksColl, id, pathImg, resolveOut) {
    if (pathImg) {
        console.log("start save img file to mongodb " + pathImg);
        let promiseImgFile = new Promise(function (resolve, reject) {
            fs.stat(pathImg, function (err, res) {
                if (err) {
                    console.log(err);
                    return;
                }
                var gridFSdb1 = new GridFSBucket(db);
                var fileReadStream1 = fs.createReadStream(pathImg);
                var openUploadStream1 = gridFSdb1.openUploadStream(pathImg);

                var license = fs.readFileSync(pathImg);
                var idImg = openUploadStream1.id;
                openUploadStream1.once('finish', function () {
                    chunksColl.update({_id: id}, {
                        $set: {
                            fileImgPathId: idImg,
                            path: pathImg
                        }
                    }, function (err, result) {
                        console.log(result);
                        resolveOut(1);
                        resolve("success");
                    })

                    fs.unlink(pathImg, function (err, result) {
                        if (err) {
                            console.log("delete compress image file failed")
                            return;
                        }
                        return "delete  compress image file success";
                    })
                })
                fileReadStream1.pipe(openUploadStream1)
            })
        });
        let waitImgFile = async function () {
            let successImgFile = await promiseImgFile;
            console.log(successImgFile + "imgFileUploadSuccess");
        }
        waitImgFile();
        return 1;
    } else {
        return 0;
    }
}

function saveMp3File2Mongodb(path, content, pathImg, resolve, updateFileName, filename, callback) {
    console.log("start save mp3 file 2 mongodb  " + updateFileName);
    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, conn) {

        if (path) {
            var db = conn.db("baidu_voice");
            var gridFSdb = new GridFSBucket(db);
            var fileReadStream = fs.createReadStream(path);
            var openUploadStream = gridFSdb.openUploadStream(path);

            var license = fs.readFileSync(path);
            var id = openUploadStream.id;

            openUploadStream.once('finish', function () {
                var chunksColl = db.collection('fs.files');
                var chunksQuery = chunksColl.find({_id: id});
                chunksQuery.toArray(function (err, ret) {
                    if (err) {
                        fs.unlink(path, function (err) {
                            if (!err) {
                                console.log("删除临时文件成功,且没有成功保存到数据库。");
                            }
                        })
                        console.log("can't find file")
                    } else {


                        chunksColl.update({_id: id}, {
                            $set: {
                                filename: updateFileName + ".mp3",
                                "content": content,
                                originFileName: filename
                            }
                        }, function (err, result) {
                            // console.log(result);
                            console.log("update mp3 related file success to mongodb " + filename);

                            //插入 上传图片
                            let returnNum = saveImgToMongodbIfHave(db, chunksColl, id, pathImg);

                            if (returnNum == 0) {
                                resolve(1)
                            }

                            if (callback) {
                                callback(id);
                            }
                        })

                        fs.unlink(path, function (err) {
                            if (!err) {
                                console.log("删除临时文件成功" + filename);
                            }
                        })

                        sendMsg("文字转语音，开始，存入mongodb数据库,文件名" + ret[0].filename)
                    }
                })
                console.log("mp3 ")
            })
            fileReadStream.pipe(openUploadStream);
        }
    })
}

function splitAndTranslate2voice(filename, index, pathImg, splitConten, spd, callback, retrys, per) {

    return new Promise(function (resolve, reject) {
        var uuid2 = uuid();
        if (!filename) {
            filename = "undefined";
        }
        var updateFileName = "";
        if (filename.indexOf("@@") > -1) {
            updateFileName = filename;
        } else {
            updateFileName = filename + "@@" + pad(index, 6);
            updateFileName = updateFileName + "  " + dateformat(new Date(), "yyyy-mm-dd HH:MM:ss");
        }

        let demo = async function () {
            if (pathImg) {
                let nowIndex = await redisClient.getNowDayIncr();
                updateFileName = filename + "@@" + pad(nowIndex, 6);
                console.log(nowIndex);
            }
            //配置参数
            var content = splitConten;
            //暂时使用随机的方式 朗读 增加趣味性
            var options = {spd: spd, per: Math.round(Math.random() * 5)}
            //正则表达式
            var reg = /[0-9\u4e00-\u9fa5\.\,\!\\\?\。\，\？\！\~\`\!\@\#\$\%\^\&\*\(\)\-\_\+\=\[\]\{\}\;\:\"\'\,\<\.\>\/\?]/g;
            var names = splitConten.match(reg);
            if (names) {
                splitConten = names.join("");
                // splitConten=splitConten.replace(/^[A-Za-z0-9\u4e00-\u9fa5]+$/g,'')
                client.text2audio(splitConten.replace(/\s+/g, ""), options).then(function (result) {
                    if (result.data) {
                        var uuid1 = uuid2 + ".mp3";
                        sendMsg("文字转语音，百度接口返回，文件名" + uuid1);
                        console.log("文字转语音,成功收到返回" + updateFileName)
                        fs.writeFile("./public/baidu_mp3/" + uuid1, result.data, function (err, ret) {
                            var path = "./public/baidu_mp3/" + uuid1;
                            saveMp3File2Mongodb(path, content, pathImg, resolve, updateFileName, filename, callback);
                        })
                    } else {
                        console.log(result);
                    }
                }, function (e) {
                    console.log("文字转语音请求超时" + e);
                    console.log("文字转语音请求超时，进行重试：" + updateFileName);
                    if (!retrys) {
                        retrys = 0;
                    }

                    let wordRetryFunc = async function(){
                        let newVar = await word2voice(splitConten, spd, per, updateFileName, retrys + 1, pathImg);
                        if(newVar == "success"){
                            resolve(1);
                        }
                    }
                    wordRetryFunc();

                })
                //     .
                // then(function (path) {
                //
                // })
            }
        }
        demo();
    })
}

function word2voice(originContent, spd, per, filename, retrys, pathImg, callback) {
    return new Promise(function (resolveVoice, rejectVoice) {
        try {
            var spd = spd;
            var per = per;
            var pathImg = pathImg;
            var length = originContent.length;
            var splits = new Array();
            var splitNum = 1000;
            if (retrys > 5) {
                console.log("已经重试5次" + filename)
                // console.log(originContent);
                var fileName = filename + "  " + dateformat(new Date(), "yyyy-mm-dd HH:MM:ss");
                if (dirExists("./public/failedTxt/")) {
                    var path2 = "./public/failedTxt/" + uuid() + ".txt";
                    if (originContent) {
                        fs.writeFile(path2, originContent, function (err, ret) {
                            if (err) {
                                console.log(err)
                            } else {
                                pathImgFailedTxtUpload(path2, fileName, pathImg, originContent, resolveVoice);
                            }
                        })
                    } else {
                        sendMsg("failed word 2 voice txt don't have content");
                    }
                    if (callback) {
                        callback("");
                    }
                }
            }
            if (length > splitNum) {
                //0 2048
                sendMsg("文字转语音，开始拆分");
                for (var index = 0; index < length; index += splitNum) {
                    if ((index + splitNum) < length) {
                        splits.push(originContent.substring(index, index + splitNum))
                    } else {
                        splits.push(originContent.substring(index, length));
                    }
                }
            } else {
                splits.push(originContent);
            }
            sendMsg("文字转语音,开始foreach")
            // splits.forEach(function (splitConten, index) {
            //     splitAndTranslate2voice(filename, index, pathImg, splitConten, spd, callback, retrys, per)
            // });
            var index = 0;
            let oneByOneWord2voice = async function () {
                let newVar = await splitAndTranslate2voice(filename, index, pathImg, splits[index], spd, callback, retrys, per);
                index = index + 1;
                if (newVar == 1 && index <= (splits.length - 1)) {
                    oneByOneWord2voice()
                }

                if (splits.length == index) {
                    resolveVoice("success");
                }

            }

            oneByOneWord2voice()
        } catch (e) {
            console.log(e);
        }
    })

}

module.exports = word2voice;