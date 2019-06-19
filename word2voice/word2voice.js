var mongoClient = require("mongodb").MongoClient;
var GridFSBucket = require("mongodb").GridFSBucket;
var AipSpeechClient = require("baidu-aip-sdk").speech;
var HttpClient = require("baidu-aip-sdk").HttpClient;
var uuid = require("uuid");
var fs = require("fs");
var producer = require("../kafkautils/kafka-producer");
var require1 = require("../kafkautils/kafka-consumer");
var dateformat = require("dateformat");


//设置 client
var client = new AipSpeechClient("16329044", "um4CpIw5abD8si05UUU7bGOg", "TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w");
//设置 百度 访问 request
HttpClient.setRequestInterceptor(function (requestOptions) {

    console.log(requestOptions);

    requestOptions.timeout = 5000;

    return requestOptions;
})

function word2voice(originContent,spd,per,filename,retrys) {
    try{
        var length = originContent.length;
        var splits = new Array();
        var splitNum = 1024;
        if(retrys > 5){
            console.log("已经重试5次"+filename)
            console.log(originContent);
            return;
        }
        if (length > splitNum) {
            //0 2048
            producer.sendMsg("文字转语音，开始拆分");
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
        producer.sendMsg("文字转语音,开始foreach")
        splits.forEach(function (splitConten, index) {
            setTimeout(function(){
                var uuid2 = uuid();
                if(!filename){
                    filename = "undefined";
                }
                var updateFileName = "";
                if(filename.indexOf("@@") > -1){
                    updateFileName = filename;
                }else{
                    updateFileName = filename+"@@"+index;
                    updateFileName = updateFileName + dateformat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT");
                }
                var content = splitConten;
                var options = {spd:spd,per:per}
                client.text2audio(splitConten.replace(/\s+/g,""),options).then(function (result) {
                    if (result.data) {
                        var uuid1 = uuid2 + ".mp3";
                        producer.sendMsg("文字转语音，百度接口返回，文件名"+uuid1);
                        console.log("文字转语音,成功收到返回"+updateFileName)
                        fs.writeFileSync(uuid1, result.data);
                        return uuid1;
                    } else {
                        console.log(result);
                    }
                }, function (e) {
                    console.log("文字转语音请求超时"+e);
                    console.log("文字转语音请求超时，进行重试："+updateFileName);
                    if(!retrys){
                        retrys = 0;
                    }
                    word2voice(splitConten,spd,per,updateFileName,retrys+1);
                }).then(function (path) {
                    var path = path;
                    console.log("test log chain")
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
                                chunksColl.update({_id:id},{$set:{filename:updateFileName,"content":content}},function(err,result){
                                    console.log(result);
                                })
                                var chunksQuery = chunksColl.find({_id: id});

                                chunksQuery.toArray(function (err, ret) {
                                    producer.sendMsg("文字转语音，存入mongodb数据库,文件名"+ret[0].filename)
                                    if (err) {
                                        console.log("can't find file")
                                    } else {
                                        fs.unlink(path, function (err) {
                                            if (!err) {
                                                console.log("删除临时文件成功");
                                            }
                                        })
                                    }
                                })
                                console.log("mp3 ")
                            })
                            fileReadStream.pipe(openUploadStream);
                        }
                    })
                })
            },5000);

        });
    }catch(e){
        console.log(e);
    }

}

module.exports = word2voice;