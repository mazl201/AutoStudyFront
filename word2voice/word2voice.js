var mongoClient = require("mongodb").MongoClient;
var GridFSBucket = require("mongodb").GridFSBucket;
var AipSpeechClient = require("baidu-aip-sdk").speech;
var HttpClient = require("baidu-aip-sdk").HttpClient;
var uuid = require("uuid");
var fs = require("fs");


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
        for (var index = 0; index < length; index += 2048) {
            if ((index + 2048) < length) {
                splits.push(content.substring(index, index + 2048))
            } else {
                splits.push(content.substring(index, length));
            }
        }
    } else {
        splits.push(content);
    }
    splits.forEach(function (splitConten, index) {
        var uuid2 = uuid();
        var updateFileName = splitConten;
        var content = splitConten;
        if (splitConten.length > 10) {
            updateFileName = splitConten.substring(0, 10);
        }
        splitConten = splitConten + new Date().getDate()
        client.text2audio(splitConten.replace(/\s+/g,"")).then(function (result) {
            if (result.data) {
                var uuid1 = uuid2 + ".mp3";
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
                        chunksColl.update({_id:id},{$set:{filename:updateFileName,"content":content}},function(err,result){
                            console.log(result);
                        })
                        var chunksQuery = chunksColl.find({_id: id});

                        chunksQuery.toArray(function (err, ret) {

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