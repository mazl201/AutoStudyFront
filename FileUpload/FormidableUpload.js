var http = require("http");
var fs = require('fs');
var formdata = require('formidable');
var word2voice = require("../word2voice/word2voice");
function onRequest(request, response) {
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

        if(file.type.indexOf("text") > -1){

            fs.readFileSync("./public/filetext/upload_773ba2970122e50b718d8c92b50d2cfb.txt",function(err,data){
                if(err){
                    console.log(err);
                    return;
                }
                word2voice(data);
            })
        }
    }).on('end', function () {
        request.startTime = new Date();
        // //默认保存的文件名是随机串，需要自己重新指定文件名和后缀
        // for (var k in request.files) {
        //     var f = request.files[k];
        //     var n = request.startTime.format('yyyyMMddHHmmss') + '_' + f.name;
        //     fs.renameSync(f.path, site.config.filePath + "/" + n);
        // }
    });
    form.parse(request);
}
//启动服务
http.createServer(onRequest).listen(3005);
