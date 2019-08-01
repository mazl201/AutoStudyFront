const fs = require('fs');
const child_process = require('child_process');
const numCPUs = require('os').cpus().length;

var readyToResolve = [];
// Fork workers.
for (var i = 0; i < numCPUs; i++) {
    var worker_process = child_process.fork("./child/child_merge_vedio.js", [i]);

    worker_process.on('message', function(m) {
        if(m.indexOf("leisure-") > -1){
            console.log("第"+m.replace("leisure-","")+"个子进程，空闲中.")
        }
        console.log('父进程正在接受子进程消息', m);
    });

    worker_process.send({hello:"父进程发送给第"+i+"个进程."})

    worker_process.on('close', function (code) {
        console.log('子进程'+i+'已退出，退出码 ' + code);
    });
}

// for(var i=0; i<3; i++) {
//     var worker_process = child_process.fork("./child/child_merge_vedio.js", [i]);
//
//     worker_process.on('close', function (code) {
//         console.log('子进程已退出，退出码 ' + code);
//     });
// }

module.exports = function (readyToMergeArr, destDir) {
    //插入到 待处理数组中
    readyToResolve.push(readyToMergeArr);


}