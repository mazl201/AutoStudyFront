var http = require("http");
var fs = require('fs');
var formdata = require('formidable');
var word2voice = require("../word2voice/word2voice");
function onRequest(request,response) {
    var form = new formdata.IncomingForm();
    form.keepExtensions = true;
    form.maxFieldsSize = 20 * 1024 * 1024;
    form.uploadDir = "./public/filetext";//指定保存文件的路径，formidable会自动保存文件
    request.files = {};
    request.data = {};
    form.on('field', function (name, value) {
        request.data[name] = value;//这里提取的是键值对数据
    }).on('file', function (name, file) {
        request.files[name] = file;//这里提取上传的文件
    }).on('end', function () {
        request.startTime = new Date();
        // //默认保存的文件名是随机串，需要自己重新指定文件名和后缀
        // for (var k in request.files) {
        //     var f = request.files[k];
        //     var n = request.startTime.format('yyyyMMddHHmmss') + '_' + f.name;
        //     fs.renameSync(f.path, site.config.filePath + "/" + n);
        // }
        fs.readdir("./public/filetext/",function(err,files){
            if (err) {
                console.log('error:\n' + err);
                return;
            }

            files.forEach(function(file){
                fs.stat("./public/filetext/" + file,function(err,stat){
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (stat.isDirectory()) {
                        // 如果是文件夹遍历
                       console.log("文件夹不能用")
                    } else {
                        fs.readFile("./public/filetext/" + file,'utf-8',function(err,data){
                            if(err){
                                console.log(err);
                                return;
                            }
                            word2voice(data);
                        })
                    }
                })
            })
        })
    });
    form.parse(request);
}
//启动服务
http.createServer(onRequest).listen(3010);
