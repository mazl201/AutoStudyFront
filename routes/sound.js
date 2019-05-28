var express = require('express');
var http = require("http");
var request1 = require("request");

var mongoClient = require("mongodb").MongoClient;
var router = express.Router();

/* GET home page. */
router.get('/mp3_list', function(req, res, next) {
    var content = new Array("1","2","3","4","5")

    mongoClient.connect("mongodb://106.12.30.238:27017",function(err,connect){
        if(err){
            console.log("mongodb connect failed");
        }else{
            var collection = connect.db("baidu_voice").collection("mp3_list");
            collection.find({}).sort({time:-1}).toArray(function(err,ret){
                if(err){
                    console.log("query mongodb baidu_voice.mp3_list failed");
                }else{
                    res.render('sound-list', { title: 'sound-upload-transferword-to-mp3',content:content});
                }
            })
        }

    })
});

router.get('/upload',function(req,res,next){
    var content = new Array("1","2","3","4","5")
    res.render('sound-upload', { title: 'sound-upload-transferword-to-mp3',content:content});
})



router.get('/upload-content',function(req,res,next){

    var request2 = request1({
        url:"http://tsn.baidu.com/text2audio",
        method: 'POST',
        strictSSL: false,
        timeout: 1500,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body:"tex=e7%99%be%e5%ba%a6%e4%bd%a0%e5%a5%bd&lan=zh&cuid=fe80514e2b609fbde162%7&ctp=1&aue=3&tok=24.4b5f49ced7e8431c6494adcf71b5bda6.2592000.1561210241.282335-16329044"
    },function(err,res,body){
        if(err){

        }

    });
    request2.on("error",function(err){
        console.log(err);
    })
    // request.on("error",function(err){
    //     console.log("http connect failed")
    // })
    // request.write("tex=我是哪个&lan=zh&cuid=fe80514e2b609fbde162%7&ctp=1&aue=3&tok=24.4b5f49ced7e8431c6494adcf71b5bda6.2592000.1561210241.282335-16329044");
    res.send("success")
})

module.exports = router;