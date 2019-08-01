const fs = require('fs');
const child_process = require('child_process');
const numCPUs = require('os').cpus().length;

var readyToResolve = [];
var alreadyToResolving = [];
var working = false;
var paDestDir = "";
// Fork workers.
var childs = [];
for (var i = 0; i < 4; i++) {
    childs[i] = child_process.fork("./child/child_merge_vedio.js", [i],{ execArgv: ['--inspect=' + (process.debugPort + i+1)] });

    childs[i].on('message', function (m) {
        if (m.indexOf("leisure-") > -1 && !working) {
            working = true;
            let cid = m.replace("leisure-", "");
            console.log("第" + cid + "个子进程，空闲中.");
            if (readyToResolve && readyToResolve.length && readyToResolve.length > 0) {
                var readyToResolveElement = readyToResolve[0];
                let resolvingName = (new Date()).getTime() + cid;
                readyToResolve.splice(0, 1);
                alreadyToResolving[resolvingName] = readyToResolveElement;
                //删除原有的 元素
                childs[cid].send({hasWork: "yes", workContent: readyToResolveElement,destDir:paDestDir,resolvingName:resolvingName});
                working = false;
            } else {
                childs[cid].send({hasWork: "no"});
                working = false;
            }
        }
        if (m.indexOf("complete-") > -1) {
            var resolvedName = m.replace("complete-", "");
            alreadyToResolving[resolvedName] = null;
        }
        console.log('父进程正在接受子进程消息', m);
    });

    childs[i].send({hasWork: "父进程发送给第" + i + "个进程."})

    childs[i].on('close', function (code) {
        console.log('子进程' + i + '已退出，退出码 ' + code);
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
    paDestDir = destDir;

}