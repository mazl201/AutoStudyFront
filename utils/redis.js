/**
 * Created by Administrator on 2019/7/4.
 */
var redis = require("redis");
var dateformat = require("dateformat");

var redisClient = redis.createClient(6379,"106.12.28.10",{});

// redisClient.auth(redisConf.Password,function(){
//     console.log("redis auth success");
// })

redisClient.on('ready',function(){
    console.log("redis connection established");
})

redisClient.on('error',function(){
    console.log("redis connection established failed");
})

redisClient.getNowDayIncr = function(){
    var nowDate = dateformat(new Date(), "yyyy-mm-dd");
    return new Promise(function(resolve, reject){
        redisClient.get(nowDate,function(err,ret){
            if(err){
                console.log(err);
                return;
            }
            if(ret){
                redisClient.incrby(nowDate,1);
                ret = ret + 1;
            }else{
                redisClient.set(nowDate,0);
                ret = 0;
            }
            resolve(ret);

        })
    });

}
module.exports = redisClient;