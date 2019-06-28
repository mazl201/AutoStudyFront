var httpClient = require("baidu-aip-sdk").HttpClient;
var ocr = require("baidu-aip-sdk").ocr;
var fs = require("fs");
var GridFSBucket = require("mongodb").GridFSBucket;
var paths = require("path");
//"16329044", "um4CpIw5abD8si05UUU7bGOg", "TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w"
var async = require("async-lock");
var lock = new async();
var schedule = require("node-schedule");
var mongoClient = require("mongodb").MongoClient;

var APP_ID = '16329044'
var API_KEY = 'um4CpIw5abD8si05UUU7bGOg';
var SECRET_KEY = 'TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w';
var client = new ocr(APP_ID, API_KEY, SECRET_KEY);
// var images = require("images");
var gm = require("gm");
var getPixels = require("get-pixels");
var dateformat = require("dateformat");
var word2voice = require("../word2voice/word2voice");
var producer = require("../kafkautils/kafka-producer");

httpClient.setRequestInterceptor(function (requestOptions) {

    // console.log(requestOptions);

    console.log("start img 2 word");

    requestOptions.timeout = 10000;

    return requestOptions;
})

function pad(num, n) {
    var len = num.toString().length;
    while(len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}


// var image = fs.readFileSync().toString("base64");
//
//
// client.generalBasic(image).then(function(result){
//     console.log(JSON.stringify(result));
//     // word2voice
// }).catch(function(err){
//     console.log(err);
// })
try {
    schedule.scheduleJob('01 * * * * *', function () {
        console.log('scheduleCronstyle:' + new Date());
        var path = "./public/images/splitImg/"
        var strings = fs.readdirSync(path);
        if (strings && strings.length > 0) {
            var pathTxt = strings[0]
            lock.acquire("splitfile2mongo", function () {
                var splitDirectory = path;
                var newSplitFileName = pathTxt.replace(splitDirectory,"");
                pathTxt = path+pathTxt;
                console.log("start rotate split img file "+pathTxt);
                gm(pathTxt)
                    .size(function (err, size) {
                        if(err){
                            console.log("rotate split img file failed")
                            fs.unlink(pathTxt, function (err) {
                                if (!err) {
                                    console.log("删除转换失败文件，失败");
                                }else{
                                    console.log("删除转换失败文件，成功");
                                }
                            })
                        }else{
                            if(size.height > size.width){
                                gm(pathTxt).rotate("white",90).write("./public/images/splitImgRotate/"+newSplitFileName,function(err,ret){
                                    if(err){
                                        console.log("rotated split img file write failed");
                                    }else{
                                        fs.unlink(pathTxt, function (err) {
                                            if (!err) {
                                                console.log("删除临时图片文件成功");
                                            }else{
                                                console.log("删除切割的图片失败");
                                            }
                                        })
                                    }
                                })
                            }else{
                                gm(pathTxt).write("./public/images/splitImgRotate/"+newSplitFileName,function(err,ret){
                                    if(err){
                                        console.log("rotated split img file write failed");
                                    }else{
                                        fs.unlink(pathTxt, function (err) {
                                            if (!err) {
                                                console.log("删除临时图片文件成功");
                                            }else{
                                                console.log("删除切割的图片失败");
                                            }
                                        })
                                    }

                                })
                            }

                        }
                    })
            })
        }
    });
} catch (e) {
    console.log(e);
}
try {
    schedule.scheduleJob('05 * * * * *', function () {
        console.log('scheduleCronstyle:' + new Date());
        var path = "./public/images/compress/"
        var strings = fs.readdirSync(path);
        if (strings && strings.length > 0) {
            var fileName = strings[0]
            lock.acquire("img2word", function () {
                producer.sendMsg("开始图像转文字");
                var image = fs.readFileSync(paths.join(path, fileName)).toString("base64");
                // 如果有可选参数
                var options = {};
                options["language_type"] = "CHN_ENG";
                options["detect_direction"] = "true";
                options["detect_language"] = "true";
                options["probability"] = "true";
                client.generalBasic(image, options).then(function (result) {
                    // console.log(JSON.stringify(result));
                    console.log("success accept img 2 word api interface response");
                    var content = "";
                    producer.sendMsg("进入图像转文字cb");
                    if (result.words_result) {
                        result.words_result.forEach(function (data) {
                            content += data.words;
                        })
                        producer.sendMsg("开始，文字转语音");
                        var path = "./public/images/compress/" + fileName;
                        lock.acquire("word2voice", function () {
                            word2voice(content, 3, 3, dateformat(new Date(), "yyyy-mm-dd HH:MM:ss"), 0, path)
                        });
                    }
                }).catch(function (err) {
                    console.log(err);
                })
            })
        }


    });
} catch (e) {
    console.log(e);
}


try {
    schedule.scheduleJob('02 * * * * *', function () {
        console.log('scheduleCronstyle:' + new Date());
        var path = "./public/images/splitImgRotate/";
        var strings = fs.readdirSync(path);
        if (strings && strings.length > 0) {
            var pathTxt = strings[0]
            lock.acquire("splitfile2mongo", function () {
                var splitDirectory = path;
                var newSplitFileName = pathTxt.replace(splitDirectory,"");
                pathTxt = path+pathTxt;
                mongoClient.connect("mongodb://106.12.28.10:27017", function (err, conn) {
                    var db = conn.db("baidu_split_file");
                    var gridFSdb = new GridFSBucket(db);
                    var fileReadStream = fs.createReadStream(pathTxt);
                    var openUploadStream = gridFSdb.openUploadStream(pathTxt);

                    var license = fs.readFileSync(pathTxt);
                    var id = openUploadStream.id;

                    openUploadStream.on("finish",function(err, conn){
                        var chunksColl = db.collection('fs.files');

                        var chunksQuery = chunksColl.find({_id: id});
                        chunksQuery.toArray(function (err, ret) {
                            if(err){
                                console.log("split file can't save to  mongodb");
                                return
                            }
                            chunksColl.update({_id:id},{$set:{filename:newSplitFileName}},function(err,result){
                                console.log(result);
                            })

                            fs.unlink(pathTxt, function (err) {
                                if (!err) {
                                    console.log("删除临时图片文件成功");
                                }else{
                                    console.log("删除切割的图片失败");
                                }
                            })
                        })
                    })
                    fileReadStream.pipe(openUploadStream);
                })
            })
        }


    });
} catch (e) {
    console.log(e);
}


function splitImgByPath(fileName, type, fileDirectory, splitDirectory) {
    gm(fileDirectory + fileName + "." + type)
        .size(function (err, size) {
            if (err) {
                console.log("img size failed");
            }else{
                var width = size.width;
                var height = size.height;
                var stride = 280;
                if(width > height){
                    for(var index = 0;index<width;index += stride){
                        var newSplitFileName = dateformat(new Date(), "yyyymmddHHMMss")+"-"+pad(index,6)+"."+type;
                        gm(fileDirectory+fileName+"."+type).crop(stride, height, index, 0).write(splitDirectory+newSplitFileName,function(err,file){
                            if(err){
                                console.log("split file failed")
                            }else{
                                console.log("split file write succeed");
                            }
                        })
                    }
                }else if(width < height){
                    for(var index = 0;index<height;index += stride){
                        var newSplitFileName = dateformat(new Date(), "yyyymmddHHMMss")+"-"+pad(index,6)+"."+type;
                        gm(fileDirectory+fileName+"."+type).crop(stride, stride, 0, index).write(splitDirectory+newSplitFileName,function(err){
                            if(err){
                                console.log("split file failed")
                            }else{
                                console.log("split file write succeed")
                            }
                        })
                    }
                }

            }
        });
}

function extracted(path, file) {
    gm(path + file)
        .size(function (err, size) {
            if (size.width > size.height) {
                gm(path + file).resize(800).write("./public/images/compress/" + file, function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    // fs.unlink(paths.join(path, file), function (err) {
                    //     if (!err) {
                    //         console.log("删除临时图片文件成功");
                    //     }
                    // })
                })
            } else {
                gm(path + file).resize(null, 1000).write("./public/images/compress/" + file, function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    // fs.unlink(paths.join(path, file), function (err) {
                    //     if (!err) {
                    //         console.log("删除临时图片文件成功");
                    //     }
                    // })
                })
            }

        })
}
function scanCompression(path) {
    try {
        fs.readdir(path, function (err, files) {
            if (err) {
                console.log('error:\n' + err);
                return;
            }
            if (files) {
                files.forEach(function (file) {
                    fs.stat(path + file, function (err, stat) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        if (stat.isDirectory()) {
                            // 如果是文件夹遍历
                            explorer(path + file);
                        } else {
                            // 读出所有的文件
                            console.log('文件名:' + path + file);
                            if (file.indexOf("\.") > -1) {
                                // 将 文件 分解
                                var files = file.split("\.");
                                lock.acquire("compress",function(){
                                    splitImgByPath(files[0], files[1], path, "./public/images/splitImg/");
                                })
                            }

                            lock.acquire("compress", function () {
                                extracted(path, file);

                            })
                        }
                    })
                })
            }
            // scanDirectory("./public/images/compress/")
        })
    } catch (e) {
        console.log(e);
    }

}

var func = {
    // scanDirectory: scanDirectory,
    scanCompression: scanCompression
}
module.exports = func

