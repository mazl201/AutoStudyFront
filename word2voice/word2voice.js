var mongoClient = require("mongodb").MongoClient;
var GridFSBucket = require("mongodb").GridFSBucket;
var AipSpeechClient = require("baidu-aip-sdk").speech;
var HttpClient = require("baidu-aip-sdk").HttpClient;
var uuid = require("uuid");
var fs = require("fs");
var producer = require("../kafkautils/kafka-producer");
var require1 = require("../kafkautils/kafka-consumer");


//设置 client
var client = new AipSpeechClient("16329044", "um4CpIw5abD8si05UUU7bGOg", "TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w");
//设置 百度 访问 request
HttpClient.setRequestInterceptor(function (requestOptions) {

    console.log(requestOptions);

    requestOptions.timeout = 5000;

    return requestOptions;
})

function word2voice(content) {
    var length = content.length;
    var splits = new Array();
    if (length > 2048) {
        //0 2048
        producer.send("文字转语音，开始拆分");
        for (var index = 0; index < length; index += 2048) {
            if ((index + 2048) < length) {
                var str = content.substring(index, index + 2048);
                splits.push(str)
            } else {
                var str = content.substring(index, length);
                splits.push(str);
            }
        }
    } else {
        splits.push(content);
    }
    producer.send("文字转语音,开始foreach")
    splits.forEach(function (splitConten, index) {
        var uuid2 = uuid();
        var updateFileName = splitConten;
        if (splitConten.length > 10) {
            updateFileName = splitConten.substring(0, 10);
        }
        splitConten = splitConten + new Date().getDate()
        client.text2audio(splitConten).then(function (result) {
            if (result.data) {
                var uuid1 = uuid2 + ".mp3";
                producer.sendMsg("文字转语音，百度接口返回，文件名"+uuid1);
                fs.writeFileSync(uuid1, result.data);
                return uuid1;
            } else {
                console.log(result);
            }
        }, function (e) {
            console.log(e);
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
                        chunksColl.update({_id:id},{$set:{filename:updateFileName}},function(err,result){
                            console.log(result);
                        })
                        var chunksQuery = chunksColl.find({_id: id});

                        // var gridFSBucketReadStream = gridFSdb.openDownloadStream(id);
                        // var testDat = gridFSdb.openUploadStream("testid.dat");
                        // gridFSBucketReadStream.pipe(testDat);

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

                        // Get all the chunks
                        // chunksQuery.toArray(function (error, docs) {
                        //     test.equal(error, null);
                        //     test.equal(docs.length, 1);
                        //     test.equal(docs[0].data.toString('hex'), license.toString('hex'));
                        //
                        //     var filesColl = db.collection('fs.files');
                        //     var filesQuery = filesColl.find({_id: id});
                        //     filesQuery.toArray(function (error, docs) {
                        //         test.equal(error, null);
                        //         test.equal(docs.length, 1);
                        //
                        //         var hash = crypto.createHash('md5');
                        //         hash.update(license);
                        //         test.equal(docs[0].md5, hash.digest('hex'));
                        //
                        //         // make sure we created indexes
                        //         filesColl.listIndexes().toArray(function (error, indexes) {
                        //             test.equal(error, null);
                        //             test.equal(indexes.length, 2);
                        //             test.equal(indexes[1].name, 'filename_1_uploadDate_1');
                        //
                        //             chunksColl.listIndexes().toArray(function (error, indexes) {
                        //                 test.equal(error, null);
                        //                 test.equal(indexes.length, 2);
                        //                 test.equal(indexes[1].name, 'files_id_1_n_1');
                        //             });
                        //         });
                        //     });
                        // });
                    })

                    fileReadStream.pipe(openUploadStream);
                }

            })
        })
    });
}

module.exports = word2voice;