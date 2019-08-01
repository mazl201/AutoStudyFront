var schedule = require("node-schedule");
var isWorking = false;

console.log("进程 " + process.argv[2] + " 执行。" );

process.on('message', function(m) {
    console.log('第'+ process.argv[2]+'个子进程，正在监听父进程消息', m);
});

try {
    var rule2 = new schedule.RecurrenceRule();
    var times2 = [1, 2,3,4,5,6,7, 9, 11, 13, 16, 19, 21, 23, 26, 29, 31, 33, 36, 39, 41, 43, 46, 49, 51, 53, 56];
    rule2.second = times2;
    schedule.scheduleJob(times2, function () {
        //如果目前处于非 执行状态
        if(!isWorking){
            process.send("leisure-"+process.argv[2]);
        }
    });
}catch (e) {
    console.log(e);
}