var httpClient = require("baidu-aip-sdk").HttpClient;
var ocr = require("baidu-aip-sdk").ocr;
var fs = require("fs");
var paths = require("path");
//"16329044", "um4CpIw5abD8si05UUU7bGOg", "TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w"

var APP_ID = '16329044'
var API_KEY = 'um4CpIw5abD8si05UUU7bGOg';
var SECRET_KEY = 'TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w';
var client = new ocr(APP_ID, API_KEY, SECRET_KEY);
// var images = require("images");
var gm = require("gm");
var dateformat = require("dateformat");
var word2voice = require("../word2voice/word2voice");
var producer = require("../kafkautils/kafka-producer");

httpClient.setRequestInterceptor(function (requestOptions) {

    console.log(requestOptions);

    requestOptions.timeout = 5000;

    return requestOptions;
})


// var image = fs.readFileSync().toString("base64");
//
//
// client.generalBasic(image).then(function(result){
//     console.log(JSON.stringify(result));
//     // word2voice
// }).catch(function(err){
//     console.log(err);
// })

function scanDirectory(path) {
    var strings = fs.readdirSync(path);
    if (strings && strings.length > 0) {
        strings.forEach(function (fileName) {
            producer.sendMsg("开始图像转文字");
            var image = fs.readFileSync(paths.join(path, fileName)).toString("base64");
            // 如果有可选参数
            var options = {};
            options["language_type"] = "CHN_ENG";
            options["detect_direction"] = "true";
            options["detect_language"] = "true";
            options["probability"] = "true";
            client.generalBasic(image, options).then(function (result) {
                console.log(JSON.stringify(result));
                var content = "";
                producer.sendMsg("进入图像转文字cb");
                if(result.words_result){
                    result.words_result.forEach(function (data) {
                        content += data.words;
                    })
                    producer.sendMsg("开始，文字转语音");
                    var path = "./public/images/compress/"+fileName;
                    word2voice(content,3,3,dateformat(new Date(), "yyyy-MM-dd HH:mm:ss"),0,path);
                }


                // fs.unlink(paths.join("./public/images/compress/", fileName), function (err) {
                //     if (!err) {
                //         console.log("删除原文件图片文件成功");
                //     }
                // })
                // word2voice
            }).catch(function (err) {
                console.log(err);
            })
        })
    }
}

function scanCompression(path) {
    try{
        fs.readdir(path, function (err, files) {
            if (err) {
                console.log('error:\n' + err);
                return;
            }
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

                        gm(path + file).resize(800,800).write("./public/images/compress/" + file,function(err){
                            if(err){
                                console.log(err);
                                return;
                            }
                            fs.unlink(paths.join(path, file), function (err) {
                                if (!err) {
                                    console.log("删除临时图片文件成功");
                                }
                            })
                        })
                    }
                })
            })
            scanDirectory("./public/images/compress/")
        })
    }catch(e){
        console.log(e);
    }

}

var func = {
    scanDirectory: scanDirectory,
    scanCompression: scanCompression
}
module.exports = func

