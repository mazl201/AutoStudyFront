var httpClient = require("baidu-aip-sdk").HttpClient;
var ocr = require("baidu-aip-sdk").ocr;
var fs = require("fs");
var paths = require("path");
//"16329044", "um4CpIw5abD8si05UUU7bGOg", "TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w"

var APP_ID = '16329044'
var API_KEY = 'um4CpIw5abD8si05UUU7bGOg';
var SECRET_KEY = 'TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w';
var client = new ocr(APP_ID, API_KEY, SECRET_KEY);

var word2voice = require("../word2voice/word2voice");

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
            var image = fs.readFileSync(paths.join(path, fileName)).toString("base64");
            client.generalBasic(image).then(function (result) {
                console.log(JSON.stringify(result));
                var content = "";
                result.words_result.forEach(function (data) {
                    content += data.words;
                })
                word2voice(content);
                fs.unlink(paths.join(path, fileName), function (err) {
                    if (!err) {
                        console.log("删除临时图片文件成功");
                    }
                })
                // word2voice
            }).catch(function (err) {
                console.log(err);
            })
        })
    }
}

module.exports = scanDirectory

