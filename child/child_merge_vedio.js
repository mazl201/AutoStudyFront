var schedule = require("node-schedule");
var fs = require("fs");
var isWorking = false;

console.log("进程 " + process.argv[2] + " 执行。" );

process.on('message', function(m) {
    console.log('第'+ process.argv[2]+'个子进程，正在监听父进程消息', m);
    if(m.hasWork){
        if(m.hasWork == "yes"){
            isWorking = true;
            async function child_wait_complete(){
                let result = await multiVedioMergeToOneFile(m.workContent, m.destDir)
                if(result){
                    process.send("complete-"+m.resolvingName);
                    isWorking = false;
                }

            }
            child_wait_complete
        }else if(m.hasWork == "no"){

        }
    }
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

function multiVedioMergeToOneFile(readyToMergeArr, destDir) {
    //建立 合并原文件
    let fileName = readyToMergeArr[0].substring(readyToMergeArr[0].lastIndexOf("\\") + 1, readyToMergeArr[0].length);
    let filePath = readyToMergeArr[0].substring(0, readyToMergeArr[0].lastIndexOf("\\") + 1);
    if(destDir){
        filePath = destDir+"\\";
    }
    let mergeStream = fs.createWriteStream(filePath + "merge" + fileName);

    // Sort 排序filePath
    readyToMergeArr.sort(function (a, b) {
        return a - b;
    });

    let currentfile = "";

    // recursive function
    function main() {
        if (!readyToMergeArr.length) {
            mergeStream.end("Done");
            return;
        }
        currentfile = readyToMergeArr.shift();
        stream = fs.createReadStream(currentfile);
        stream.pipe(mergeStream, {end: false});
        stream.on("end", function () {
            console.log(currentfile + ' appended');
            main();
        });
    }

    main();
}