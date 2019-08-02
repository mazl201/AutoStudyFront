var express = require('express');
var router = express.Router();
var fs = require("fs");
var saveToQueue = require("../child/parent_merge_vedio");
var rar = require("../utils/compress-rar");
var compressing = require("compressing");

var paths = require("path");
//加载redis
var redisClient = require("../utils/redis");
var dateformat = require("dateformat");

router.get("/initMove", function (req, res, next) {
    res.render('move', {title: '欢迎来到第一阶段，文件转移'});
})


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

function pad(num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
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

router.post("/mergeForVoice", function (req, res, next) {
    if (req.body.filePath && req.body.fileDestPath) {
        var scanFileDir = req.body.filePath;
        if(dirExists(req.body.fileDestPath)){
            groupAndOneByOne(scanFileDir,req.body.fileDestPath);
        }
    }
})

function restoreFileName(data,path) {
    if (data.lastIndexOf("avi") > -1) {
        fs.renameSync(path+data,path+data.replace("avi","")+".avi");
    } else if (data.lastIndexOf("mp4") > -1) {
        fs.renameSync(path+data,path+data.replace("mp4","")+".mp4");
    } else if (data.lastIndexOf("wmv") > -1) {
        fs.renameSync(path+data,path+data.replace("wmv","")+".wmv");
    } else if (data.lastIndexOf("flv") > -1) {
        fs.renameSync(path+data,path+data.replace("flv","")+".flv");
    } else if (data.lastIndexOf("mov") > -1) {
        fs.renameSync(path+data,path+data.replace("mov","")+".mov");
    } else if (data.lastIndexOf("rmvb") > -1) {
        fs.renameSync(path+data,path+data.replace("rmvb","")+".rmvb");
    } else if (data.lastIndexOf("rm") > -1) {
        fs.renameSync(path+data,path+data.replace("rm","")+".rm");
    } else if (data.lastIndexOf("3gp") > -1) {
        fs.renameSync(path+data,path+data.replace("3gp","")+".3gp");
    } else if (data.lastIndexOf("asf") > -1) {
        fs.renameSync(path+data,path+data.replace("asf","")+".asf");
    } else if (data.lastIndexOf("mkv") > -1) {
        fs.renameSync(path+data,path+data.replace("mkv","")+".mkv");
    } else if (data.lastIndexOf("f4v") > -1) {
        fs.renameSync(path+data,path+data.replace("f4v","")+".f4v");
    } else if (data.lastIndexOf("mp4") > -1) {
        fs.renameSync(path+data,path+data.replace("mp4","")+".mp4");
    } else if (data.lastIndexOf("webm") > -1) {
        fs.renameSync(path+data,path+data.replace("webm","")+".webm");
    } else if (data.lastIndexOf("qsv") > -1) {
        fs.renameSync(path+data,path+data.replace("qsv","")+".qsv");
    } else if (data.lastIndexOf("swf") > -1) {
        fs.renameSync(path+data,path+data.replace("swf","")+".swf");
    }
}

function splitIntoBySuffix(path, destDir) {
    var strings = fs.readdirSync(path);
    // let dir = path.substring(0,path.lastIndexOf("\\")+1);
    var result = [];
    var suffixs = new Array();
    strings.forEach(function (data, index) {
        if(isVedioFile(data)){

            // restoreFileName(data,path+"\\");

            let suffix = data.substring(data.lastIndexOf("."),data.length);
            var newFileName =data.split("@@@")[0]+"@@@"+data.split("@@@")[1]+"@@@"+ pad(parseInt(data.split("@@@")[2]),4)+ suffix;

            fs.renameSync(path+"\\"+data,path+"\\"+newFileName);
            var dirName = suffix;
            if (result[dirName]) {
                result[dirName].push(path +"\\"+ newFileName)
            } else {
                suffixs.push(dirName)
                result[dirName] = new Array();
                result[dirName].push(path +"\\"+ newFileName);
            }
        }

    })
    for (var suf in suffixs) {
        var dontainedDir = result[suffixs[suf]];
        for(var j in dontainedDir){
            if(dirExists(destDir+"\\"+suffixs[suf])){
                fs.copyFileSync(dontainedDir[j],destDir+"\\"+suffixs[suf]+"\\"+dontainedDir[j].substring(dontainedDir[j].lastIndexOf("\\"),dontainedDir[j].length));
            }
        }
    }
}

router.post("/mergeBySuffix", function (req, res, next) {
    if (req.body.filePath && req.body.fileDestPath) {
        var scanFileDir = req.body.filePath;
        if(dirExists(req.body.fileDestPath)){
            splitIntoBySuffix(scanFileDir,req.body.fileDestPath);
        }
    }
})

function groupAndOneByOne(path,destDir) {
    var strings = fs.readdirSync(path);
    // let dir = path.substring(0,path.lastIndexOf("\\")+1);
    var result = [];
    strings.forEach(function (data, index) {
        if(isVedioFile(data)){
            let suffix = data.substring(data.lastIndexOf("."),data.length);
            var newFileName =data.split("@@@")[0]+"@@@"+data.split("@@@")[1]+"@@@"+ pad(parseInt(data.split("@@@")[2]),4)+ suffix;

            fs.renameSync(path+"\\"+data,path+"\\"+newFileName);
            var dirName = data.split("@@@")[0]+suffix;
            if (result[dirName]) {
                result[dirName].push(path +"\\"+ newFileName)
            } else {
                result[dirName] = new Array();
                result[dirName].push(path +"\\"+ newFileName);
            }
        }

    })
    for (var i in result) {
        saveToQueue(result[i], destDir);
    }


}

router.post("/finallyRMVedio", function (req, res, next) {
    if (req.body.filePath && req.body.fileDestPath) {
        var dirPath = req.body.filePath;

        var vedioArr = new Array();

        var weHavedSuffix = new Array();

        weHavedSuffix.push("mp4")


        // var vedioDestDir = dirPath + "\\copyVedio";
        var vedioDestDir = req.body.fileDestPath;
        if (dirExists(vedioDestDir)) {
            var stats = fs.statSync(dirPath);

            if (stats.isDirectory()) {
                //进入 循环
                recursiveDir(dirPath, vedioArr, vedioDestDir, weHavedSuffix, 0);

                recursiveUnzip(dirPath, vedioArr, vedioDestDir, weHavedSuffix, 0);

                let array = new Array();
                weHavedSuffix.forEach(function (suffix) {
                    array = array.filter(word => word != suffix);
                    array.push(suffix);
                })
                res.end("文件解析完成");
            } else {
                res.end("文件不能解析");
            }
        }
    }
})

var nowSuffix;

function recursiveUnzip(dirPath, vedioArr, vedioDestDir, weHavedSuffix, nowIndex) {
    try {
        var prefixFileName = "";
        var dateformat1 = dateformat(new Date(), "yyyy-mm-dd");
        nowIndex = nowIndex + 1;
        prefixFileName = dateformat1 + nowIndex;

        //读取 目录 以下
        var filesUnderDir = fs.readdirSync(dirPath);

        if (filesUnderDir && filesUnderDir.length > 0) {
            var fileIndex = 0;
            // filesUnderDir.forEach(function (fileOrDirName, index) {
            //
            // })
            var index = 0;

            function oneByOneUnzipFile() {
                return new Promise(function (resolveUnzip, rejectUnzip) {
                    var fileOrDirName = filesUnderDir[index]
                    let forEachStat = fs.statSync(dirPath + "\\" + fileOrDirName)

                    if (forEachStat.isDirectory()) {
                        recursiveUnzip(dirPath + "\\" + fileOrDirName, vedioArr, vedioDestDir, weHavedSuffix, nowIndex);
                        resolveUnzip(true);
                    } else if (forEachStat.isFile()) {
                        let lastDotIndexOf = fileOrDirName.lastIndexOf("\.")
                        let suffix = ""
                        if (lastDotIndexOf) {
                            suffix = fileOrDirName.substring(lastDotIndexOf + 1, fileOrDirName.length).toLowerCase();
                            // weHavedSuffix = weHavedSuffix.filter(word => word != suffix);
                            weHavedSuffix.push(suffix);
                            console.log(suffix + "can be is");
                        }

                        let newDirPath = dirPath.replace(/\s+/g, "");
                        let newPath = newDirPath + "\\" + fileOrDirName.replace(/\s+/g, "");
                        if (dirExists(newDirPath)) {
                            //判断是否是 压缩文件
                            if (suffix == "gz" || suffix == "gz2") {
                                fs.renameSync(dirPath + "\\" + fileOrDirName, newPath);
                                var promiseZip = compressing.rar.uncompress(newPath, dirPath + "\\" + fileOrDirName.toLowerCase().replace("." + suffix, "").replace(/\s+/g, ""));

                                async function unCompress() {
                                    await promiseZip;
                                    resolveUnzip(true);
                                    // recursiveDir()
                                }

                                unCompress();
                                //留存记录
                                vedioArr.push(dirPath + "\\" + fileOrDirName);
                            } else if (suffix == "tgz") {
                                fs.renameSync(dirPath + "\\" + fileOrDirName, newPath);
                                var promiseTgz = compressing.tar.uncompress(newPath, dirPath + "\\" + fileOrDirName.toLowerCase().replace("." + suffix, "").replace(/\s+/g, ""));

                                async function unCompress() {
                                    await promiseTgz;
                                    resolveUnzip(true);
                                    // recursiveDir()
                                }

                                unCompress();
                                //留存记录
                                vedioArr.push(dirPath + "\\" + fileOrDirName);
                            } else if (suffix == "zip") {
                                fs.renameSync(dirPath + "\\" + fileOrDirName, newPath);
                                var promiseRar = compressing.zip.uncompress(newPath, dirPath + "\\" + fileOrDirName.toLowerCase().replace("." + suffix, "").replace(/\s+/g, ""));

                                async function unCompress() {
                                    await promiseRar;
                                    resolveUnzip(true);
                                    // recursiveDir()
                                }

                                unCompress();
                                //留存记录
                                vedioArr.push(dirPath + "\\" + fileOrDirName);
                            } else if (suffix == "rar") {
                                fs.renameSync(dirPath + "\\" + fileOrDirName, newPath);

                                async function oneByoneUncompressFile() {
                                    let destPath = newDirPath + "\\" + fileOrDirName.toLowerCase().replace("." + suffix, "").replace(/\s+/g, "");
                                    if (dirExists(destPath)) {
                                        let newVar1 = await rar.decompress({
                                            rarPath: newPath,
                                            resolve: resolveUnzip,
                                            destPath: destPath
                                        });
                                        if (newVar1 == true) {
                                            resolveUnzip(true);
                                        }
                                    }

                                }

                                oneByoneUncompressFile()
                                //留存记录
                                vedioArr.push(dirPath + "\\" + fileOrDirName);
                            } else {
                                console.log("don't need uncompress,so go away");
                                resolveUnzip(true);
                            }
                        }
                    } else {
                        console.log("文件既不是文件，也不是文件夹");
                        return true;
                    }
                })
            }

            async function executeOneByOne() {
                let newVar = await oneByOneUnzipFile();
                index = index + 1;
                if (newVar == true && index < filesUnderDir.length) {
                    executeOneByOne();
                }
                if (index == filesUnderDir.length) {
                    return;
                }
            }

            executeOneByOne();
        } else {
            console.log(filesUnderDir + " 是一个空文件夹");
            return true;
            ;
        }
    } catch (e) {
        console.log(e);
    }
}

function recursiveDir(dirPath, vedioArr, vedioDestDir, weHavedSuffix, nowIndex) {
    try {
        var prefixFileName = "";
        var dateformat1 = dateformat(new Date(), "yyyy-mm-dd");
        nowIndex = nowIndex + 1;
        prefixFileName = dateformat1 + nowIndex;

        //读取 目录 以下
        var filesUnderDir = fs.readdirSync(dirPath);

        if (filesUnderDir && filesUnderDir.length > 0) {
            var fileIndex = 0;
            var readyToMergeArr = new Array();
            filesUnderDir.forEach(function (fileOrDirName, index) {
                // function nextExecute(){
                //
                // }
                let forEachStat = fs.statSync(dirPath + "\\" + fileOrDirName)

                if (forEachStat.isDirectory()) {
                    recursiveDir(dirPath + "\\" + fileOrDirName, vedioArr, vedioDestDir, weHavedSuffix, nowIndex);
                } else if (forEachStat.isFile()) {
                    let lastDotIndexOf = fileOrDirName.lastIndexOf("\.")
                    if (lastDotIndexOf) {
                        let suffix = fileOrDirName.substring(lastDotIndexOf + 1, fileOrDirName.length);
                        nowSuffix = suffix;
                        // weHavedSuffix = weHavedSuffix.filter(word => word != suffix);
                        weHavedSuffix.push(suffix);
                        console.log(suffix + "can be is");
                    }

                    //判断是否是 视频文件
                    if (isVedioFile(fileOrDirName)) {

                        //直接copy 文件 无需 异步
                        // fs.copyFileSync(dirPath + "\\" + fileOrDirName, vedioDestDir + "\\" + prefixFileName + "-" + fileOrDirName);
                        let number = parseInt(nowIndex / 10);
                        let tempVedioDestDir = vedioDestDir + dateformat1;

                        if (dirExists(tempVedioDestDir)) {

                            prefixFileName.replace()
                            fileIndex = fileIndex + 1;
                            let indexFileName = pad(fileIndex, 4)
                            let newPath = tempVedioDestDir + "\\" + prefixFileName + "@@@" + fileOrDirName.replace("." + nowSuffix, "") + "@@@" + indexFileName + "." + nowSuffix;
                            fs.renameSync(dirPath + "\\" + fileOrDirName, newPath);
                            //准备 待 合并
                            readyToMergeArr.push(newPath);
                        }
                        //留存记录
                        vedioArr.push(dirPath + "\\" + fileOrDirName);
                    }
                } else {
                    console.log("文件既不是文件，也不是文件夹");
                }
            })

            if (readyToMergeArr.length && readyToMergeArr.length > 0) {
                multiVedioMergeToOneFile(readyToMergeArr);
                // //调用 多个 文件 合并为 一个文件
                // let waitMergeToOnFile = async function () {
                //     let waitPromise = new Promise(function (resolve, reject) {
                //
                //     })
                //     let newVar = await waitPromise;
                //     if (newVar == true) {
                //         console.log("file compress success");
                //     }
                // }
                // waitMergeToOnFile();
            }
        } else {
            console.log(filesUnderDir + " 是一个空文件夹")
            return;
        }
    } catch (e) {
        console.log(e);
    }
}

function multiVedioMergeToOneFile(readyToMergeArr, destDir) {
    //建立 合并原文件
    let fileName = readyToMergeArr[0].substring(readyToMergeArr[0].lastIndexOf("\\") + 1, readyToMergeArr[0].length);
    let filePath = readyToMergeArr[0].substring(0, readyToMergeArr[0].lastIndexOf("\\") + 1);
    if(destDir){
        filePath = destDir+"\\";
    }
    let mergeStream = fs.createWriteStream(filePath + "merge" + fileName);

    // Sort 排序filePath
    readyToMergeArr.sort(function (a, b) {
        return a - b;
    });

    let currentfile = "";

    // recursive function
    function main() {
        if (!readyToMergeArr.length) {
            mergeStream.end("Done");
            return;
        }
        currentfile = readyToMergeArr.shift();
        stream = fs.createReadStream(currentfile);
        stream.pipe(mergeStream, {end: false});
        stream.on("end", function () {
            console.log(currentfile + ' appended');
            main();
        });
    }

    main();
}


function isVedioFile(fileOrDirName) {
    if (fileOrDirName) {
        let lastDotIndexOf = fileOrDirName.lastIndexOf("\.")
        if (lastDotIndexOf) {
            let suffix = fileOrDirName.substring(lastDotIndexOf + 1, fileOrDirName.length).toLowerCase();
            if (suffix == "avi") {
                return true;
            } else if (suffix == "mp4") {
                return true;
            } else if (suffix == "wmv") {
                return true;
            } else if (suffix == "flv") {
                return true;
            } else if (suffix == "mov") {
                return true;
            } else if (suffix == "rmvb") {
                return true;
            } else if (suffix == "rm") {
                return true;
            } else if (suffix == "3gp") {
                return true;
            } else if (suffix == "asf") {
                return true;
            } else if (suffix == "mkv") {
                return true;
            } else if (suffix == "f4v") {
                return true;
            } else if (suffix == "rmhd") {
                return true;
            } else if (suffix == "webm") {
                return true;
            } else if (suffix == "qsv") {
                return true;
            } else if (suffix == "swf") {
                return true;
            }
            return false;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

module.exports = router;