var httpClient = require("baidu-aip-sdk").HttpClient;
var ocr = require("baidu-aip-sdk").ocr;
var fs = require("fs");
var GridFSBucket = require("mongodb").GridFSBucket;
var paths = require("path");
//"16329044", "um4CpIw5abD8si05UUU7bGOg", "TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w"
var async = require("async-lock");
var lock = new async();
var schedule = require("node-schedule");
var sendMsg = require("../kafkautils/kafka-producer");
var mongoClient = require("mongodb").MongoClient;
//加载redis
var redisClient = require("../utils/redis");
var dateformat = require("dateformat");

var APP_ID = '16329044'
var API_KEY = 'um4CpIw5abD8si05UUU7bGOg';
var SECRET_KEY = 'TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w';
var client = new ocr(APP_ID, API_KEY, SECRET_KEY);
// var images = require("images");
var gm = require("gm");
var getPixels = require("get-pixels");

var word2voice = require("../word2voice/word2voice");


/**
 * 读取路径信息
 * @param {string} path 路径
 */
function getStat(path) {
    if (path) {
        try {
            fs.statSync(path)
            return true;
        } catch (e) {
            console.log("not directory")
            return false;
        }
    }
}

/**
 * 创建路径
 * @param {string} dir 路径
 */
function mkdir(dir) {
    try {
        fs.mkdirSync(dir);
        return true;
    } catch (e) {
        console.log("directory make failed,please dispose it manually")
        return false;
    }
}

/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
function dirExists(dir) {
    var isExists = getStat(dir);
    //如果该路径且不是文件，返回true
    if (isExists) {
        return true;
    } else if (isExists) {     //如果该路径存在但是文件，返回false
        return false;
    }
    //如果该路径不存在
    var tempDir = paths.parse(dir).dir;      //拿到上级路径
    //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
    var status = dirExists(tempDir);
    var mkdirStatus;
    if (status) {
        mkdirStatus = mkdir(dir);
        return mkdirStatus;
    }
    return mkdirStatus;
}

httpClient.setRequestInterceptor(function (requestOptions) {

    // console.log(requestOptions);

    console.log("start img 2 word");

    requestOptions.timeout = 10000;

    return requestOptions;
})

function pad(num, n) {
    var len = num.toString().length;
    while (len < n) {
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
    var rule2 = new schedule.RecurrenceRule();
    var times2 = [1, 3, 6, 9, 11, 13, 16, 19, 21, 23, 26, 29, 31, 33, 36, 39, 41, 43, 46, 49, 51, 53, 56];
    rule2.second = times2;
    schedule.scheduleJob(times2, function () {
        console.log('scheduleCronstyle:scanSplitImg ' + new Date());
        if (dirExists("./public/images/splitImg/")) {
            var path = "./public/images/splitImg/"
            var strings = fs.readdirSync(path);
            if (strings && strings.length > 0) {
                var pathTxt = strings[0]
                lock.acquire("splitfile2mongo", function () {
                    var splitDirectory = path;
                    var newSplitFileName = pathTxt.replace(splitDirectory, "");
                    pathTxt = path + pathTxt;
                    console.log("start rotate split img file " + pathTxt);
                    gm(pathTxt)
                        .size(function (err, size) {
                            if (err) {
                                console.log("rotate split img file failed")
                                fs.unlink(pathTxt, function (err) {
                                    if (err) {
                                        console.log("读取文件，长度和宽度失败");
                                    } else {
                                        console.log("读取文件，长度和宽度成功");
                                    }
                                })
                            } else {
                                if (size.height > size.width) {
                                    if (dirExists("./public/images/splitImgRotate/")) {
                                        gm(pathTxt).rotate("white", 90).write("./public/images/splitImgRotate/" + newSplitFileName, function (err, ret) {
                                            if (err) {
                                                console.log("rotated split img file write failed");
                                            } else {
                                                fs.unlink(pathTxt, function (err) {
                                                    if (!err) {
                                                        console.log("删除临时旋转图片成功");
                                                    } else {
                                                        console.log("删除临时旋转图片失败");
                                                    }
                                                })
                                            }
                                        })
                                    }
                                } else {

                                    if (dirExists("./public/images/splitImgRotate/")) {
                                        gm(pathTxt).write("./public/images/splitImgRotate/" + newSplitFileName, function (err, ret) {
                                            if (err) {
                                                console.log("rotated split img file write failed");
                                            } else {
                                                fs.unlink(pathTxt, function (err) {
                                                    if (!err) {
                                                        console.log("删除临时旋转图片成功");
                                                    } else {
                                                        console.log("删除临时旋转图片失败");
                                                    }
                                                })
                                            }

                                        })
                                    }

                                }

                            }
                        })
                })
            }
        }
    });
} catch (e) {
    console.log(e);
}

function oneByoneReadImgWord2Voice(fileName, path) {
    return new Promise(function (resolveImg, rejectImg) {
        sendMsg("开始图像转文字");
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
            sendMsg("进入图像转文字cb");
            if (result.words_result) {
                result.words_result.forEach(function (data) {
                    content += data.words;
                })
                sendMsg("开始，文字转语音");
                var path = "./public/images/compress/" + fileName;

                let waitWord2voiceComplete = async function () {
                    let word2voiceResult = await word2voice(content, 3, 3, dateformat(new Date(), "yyyy-mm-dd"), 0, path);
                    if (word2voiceResult == "success") {
                        resolveImg("success");
                    } else if (word2voiceResult == "failed") {
                        resolveImg("cantvoice");
                    }
                }
                waitWord2voiceComplete();

            } else {
                resolveImg("noWord");
            }
        }).catch(function (err) {
            resolveImg("cantgetImg2Word");
            console.log(err);
        })
    })

}

try {
    var rule2 = new schedule.RecurrenceRule();
    var times2 = [1, 3, 6, 9, 11, 13, 16, 19, 21, 23, 26, 29, 31, 33, 36, 39, 41, 43, 46, 49, 51, 53, 56];
    rule2.minute = times2;
    schedule.scheduleJob(times2, function () {
        console.log('scheduleCronstyle:compressImg ' + new Date());
        if (dirExists("./public/images/splitImgRotate/") && dirExists("./public/images/compress/")) {
            var path = "./public/images/compress/";
            var strings = fs.readdirSync(path);
            if (strings && strings.length > 0) {
                var index = 0;
                let oneByoneDisposeImg = async function () {
                    let result = await oneByoneReadImgWord2Voice(strings[index], path);
                    index = index + 1;
                    if (result == "success") {
                        if(path && strings[index]){
                            fs.unlink(paths.join(path, strings[index]), function (err, result) {
                                if (err) {
                                    console.log("delete compress image file failed")
                                    return;
                                }
                                return "delete  compress image file success " + strings[index];
                            })
                        }
                        oneByoneDisposeImg();
                    } else if (result == "noWord") {
                        oneByoneDisposeImg();
                    } else if (result == "cantvoice") {
                        oneByoneDisposeImg();
                    } else if (result == "cantgetImg2Word") {
                        console.log("接口 未能 返回 但仍然繼續 執行");
                        oneByoneDisposeImg();
                    }
                }
                oneByoneDisposeImg();
            }
        }
    });
} catch (e) {
    console.log(e);
}


var ruleOut = new schedule.RecurrenceRule();
var ruleOut = [1, 3, 6, 9, 11, 13, 16, 19, 21, 23, 26, 29, 31, 33, 36, 39, 41, 43, 46, 49, 51, 53, 56];
rule2.second = ruleOut;
schedule.scheduleJob(ruleOut, function () {
    try {
        console.log('scheduleCronstyle:scanSplitImgRotate ' + new Date());
        if (dirExists("./public/images/splitImgRotate/")) {
            var path = "./public/images/splitImgRotate/";
            var strings = fs.readdirSync(path);
            if (strings && strings.length > 0) {
                var pathTxt = strings[0]
                lock.acquire("splitfile2mongo", function () {
                    var splitDirectory = path;
                    var newSplitFileName = pathTxt.replace(splitDirectory, "");
                    pathTxt = path + pathTxt;
                    mongoClient.connect("mongodb://106.12.28.10:27017", function (err, conn) {
                        if (err) {
                            console.log("split file save to mongodb connect failed");
                            return;
                        }
                        var db = conn.db("baidu_split_file");
                        var gridFSdb = new GridFSBucket(db);
                        var fileReadStream = fs.createReadStream(pathTxt);
                        var openUploadStream = gridFSdb.openUploadStream(pathTxt);

                        var license = fs.readFileSync(pathTxt);
                        var id = openUploadStream.id;

                        openUploadStream.on("finish", function (err, conn) {
                            var chunksColl = db.collection('fs.files');

                            var chunksQuery = chunksColl.find({_id: id});
                            chunksQuery.toArray(function (err, ret) {
                                if (err) {
                                    console.log("split file can't save to  mongodb");
                                    return
                                }
                                chunksColl.update({_id: id}, {$set: {filename: newSplitFileName}}, function (err, result) {
                                    console.log(result);
                                })

                                fs.unlink(pathTxt, function (err) {
                                    if (!err) {
                                        console.log("删除临时裁剪图片文件成功");
                                    } else {
                                        console.log("删除临时裁剪图片文件失败");
                                    }
                                })
                            })
                        })
                        fileReadStream.pipe(openUploadStream);
                    })
                })
            }
        }
    } catch (e) {
        console.log(e);
    }

});


function splitImgByPath(fileName, type, fileDirectory, splitDirectory) {
    return new Promise(function (resolve, reject) {
        gm(fileDirectory + fileName + "." + type)
            .size(function (err, size) {
                if (err) {
                    console.log("img size failed");

                } else {
                    var width = size.width;
                    var height = size.height;
                    var stride = 280;
                    var totalOne = 0;
                    if (width > height) {
                        for (var index = 0; index < width; index += stride) {
                            var newSplitFileName = dateformat(new Date(), "yyyymmddHHMMss") + "-" + pad(index, 6) + "." + type;
                            let onlyOne = new Promise(function (resolve, reject) {
                                gm(fileDirectory + fileName + "." + type).crop(stride, height, index, 0).write(splitDirectory + newSplitFileName, function (err, file) {
                                    if (err) {
                                        resolve(0);
                                        console.log("split file failed")
                                    } else {
                                        resolve(1);
                                        console.log("split file write succeed");
                                    }
                                })
                            })
                            onlyOne.catch(function () {
                                console.log("can't get promise result")
                            })
                            let waitOnlyOne = async function () {
                                let newVar = await onlyOne;
                                totalOne += newVar
                                if (totalOne == parseInt(height / stride)) {
                                    resolve(true)
                                }
                            }
                            waitOnlyOne();

                        }
                    } else if (width < height) {
                        for (var index = 0; index < height; index += stride) {
                            var newSplitFileName = dateformat(new Date(), "yyyymmddHHMMss") + "-" + pad(index, 6) + "." + type;
                            let onlyOne = new Promise(function (resolve, reject) {
                                gm(fileDirectory + fileName + "." + type).crop(stride, stride, 0, index).write(splitDirectory + newSplitFileName, function (err) {
                                    if (err) {
                                        resolve(0);
                                        console.log("split file failed")
                                    } else {
                                        resolve(1);
                                        console.log("split file write succeed")
                                    }
                                })
                            })
                            onlyOne.catch(function () {
                                console.log("can't get promise result")
                            })
                            let waitOnlyOne = async function () {
                                let newVar = await onlyOne;
                                totalOne += newVar
                                if (totalOne == parseInt(height / stride)) {
                                    resolve(true)
                                }
                            }
                            waitOnlyOne();

                        }
                    }

                }
            });
    })
}

function compressImgFile2CompressDir(path, file) {
    if (dirExists("./public/images/compress/")) {
        return new Promise(function (resolove, reject) {
            gm(path + file)
                .size(function (err, size) {
                    if (err) {
                        console.log("can't read png file size");
                        resolove(false);
                        return;
                    }

                    if (size.width > size.height) {
                        gm(path + file).resize(800).write("./public/images/compress/" + file, function (err) {
                            if (err) {
                                resolove(false);
                                console.log(err);
                                return;
                            }
                            resolove(true);
                        })
                    } else {
                        gm(path + file).resize(null, 1000).write("./public/images/compress/" + file, function (err) {
                            if (err) {
                                resolove(false);
                                console.log(err);
                                return;
                            }
                            resolove(true);
                        })
                    }

                })
        })
    }
}

function compressOrSplitImg(path) {
    try {
        fs.readdir(path, function (err, files) {
            if (err) {
                console.log('error:\n' + err);
                return;
            }
            if (files && files.length > 0) {
                var index = 0;
                function getCSpromise(){
                    return new Promise(function(resolveCS, rejectCS){
                        var file = files[index];
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
                                    let splitResult = false;
                                    var compressResult = false;
                                    let splitCompleteAsync = async function () {
                                        splitResult = await splitImgByPath(files[0], files[1], path, "./public/images/splitImg/");
                                        if (splitResult && compressResult) {
                                            resolveCS("yes")
                                            fs.unlinkSync(path + file)
                                        }
                                    }
                                    splitCompleteAsync();
                                    let extractAsync = async function () {
                                        compressResult = await compressImgFile2CompressDir(path, file);
                                        if (splitResult && compressResult) {
                                            resolveCS("yes")
                                            fs.unlinkSync(path + file)
                                        }
                                    }
                                    extractAsync()
                                }


                            }
                        })
                    });
                }

                // files.forEach()
                let oneByoneCSdispose = async function(){
                    let newVar = await getCSpromise();
                    index = index + 1;
                    if(newVar == "yes" && index < files.length){
                        oneByoneCSdispose();
                    }

                    // if(index == files.length){
                    //
                    // }
                }

                oneByoneCSdispose();
            }
            // scanDirectory("./public/images/compress/")
        })
    } catch (e) {
        console.log(e);
    }
}

function compressUploadFileToHandleImg(path) {
    if (dirExists("./public/images/splitImg/")) {
        compressOrSplitImg(path)
    }
}

var func = {
    // scanDirectory: scanDirectory,
    scanCompression: compressUploadFileToHandleImg
}
module.exports = func

