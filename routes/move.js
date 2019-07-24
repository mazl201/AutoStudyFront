var express = require('express');
var router = express.Router();
var fs = require("fs");

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

router.post("/finallyRMVedio", function (req, res, next) {
    if (req.body.filePath) {
        var dirPath = req.body.filePath;

        var vedioArr = new Array();

        var weHavedSuffix = new Array();

        weHavedSuffix.push("mp4")


        // var vedioDestDir = dirPath + "\\copyVedio";
        var vedioDestDir = "F:\\test1";
        if (dirExists(vedioDestDir)) {
            var stats = fs.statSync(dirPath);

            if (stats.isDirectory()) {
                //进入 循环
                recursiveDir(dirPath, vedioArr, vedioDestDir, weHavedSuffix,0);
                let array = new Array();
                weHavedSuffix.forEach(function(suffix){
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

function isSame(element) {
    return element == nowSuffix;
}

function recursiveDir(dirPath, vedioArr, vedioDestDir, weHavedSuffix, nowIndex) {
    try{
        var prefixFileName = "";
        var dateformat1 = dateformat(new Date(), "yyyy-mm-dd");
        nowIndex = nowIndex + 1;
        prefixFileName = dateformat1 + nowIndex;

        //读取 目录 以下
        var filesUnderDir = fs.readdirSync(dirPath);

        if (filesUnderDir && filesUnderDir.length > 0) {

            filesUnderDir.forEach(function (fileOrDirName, index) {

                let forEachStat = fs.statSync(dirPath + "\\" + fileOrDirName)

                if (forEachStat.isDirectory()) {
                    recursiveDir(dirPath + "\\" + fileOrDirName, vedioArr, vedioDestDir, weHavedSuffix,nowIndex);
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
                        fs.renameSync(dirPath + "\\" + fileOrDirName, vedioDestDir + "\\" + prefixFileName + "@@" + fileOrDirName);
                        //留存记录
                        vedioArr.push(dirPath + "\\" + fileOrDirName);
                    }
                } else {
                    console.log("文件既不是文件，也不是文件夹");
                }
            })
        } else {
            console.log(filesUnderDir + " 是一个空文件夹")
            return;
        }
    }catch(e){
        console.log(e);
    }
}

function isVedioFile(fileOrDirName) {
    if (fileOrDirName) {
        let lastDotIndexOf = fileOrDirName.lastIndexOf("\.")
        if (lastDotIndexOf) {
            let suffix = fileOrDirName.substring(lastDotIndexOf + 1, fileOrDirName.length);
            if (suffix == "avi") {
                return true;
            } else if (suffix == "mp4") {
                return true;
            } else if (suffix == "wmv") {
                return true;
            } else if (suffix == "flv") {
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