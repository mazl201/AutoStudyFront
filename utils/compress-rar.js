const fs = require('fs');
const exec = require('child_process').exec;
const cp = require('child_process');

/**
 * 执行cmd
 * @param cmd
 */
function execute(cmd, resolve) {
    cp.exec(cmd, {encoding: 'binary'}, function (err, stdout, stderr) {
        if (err) {
            console.log(`err:${err}`);
        }
        if (stderr) {
            console.log(`stderr:${stderr}`);
        }
        if (resolve) {
            resolve(true);
        }
    });
}

function spawnExec(cmd1,cmd2,resolve){
    var ls = cp.spawn(cmd1,cmd2,{encoding: 'binary'} );
    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    ls.on('exit', function (code) {
        resolve(true);
        console.log('child process exited with code ' + code);
    });
}

/**
 * 判断文件或者路径是否存在
 * @param path
 * @param success 成功回调函数
 * @param error 错误回调函数
 */
function exist(path, success, error) {
    fs.exists(path, (exists) => {
        if (exists) {
            success && success();
        } else {
            console.log(`${path} not exist and create...`);
            error && error();
        }
    });
}

const rar = {
    /**
     * 压缩文件
     * @param config
     */
    compress: function (config) {
        let cmd = `rar a ${config.rarPath} ${config.srcPath} -y`;
        exist(config.srcPath, () => {
            execute(cmd);
        });
    },
    /**
     * 解压文件
     * @param config
     */
    decompress: function (config) {
        let cmd = `rar x ${config.rarPath} ${config.destPath} -y`;
        // let cmd1 = `rar r ${config.rarPath}`;
        let cmd2 = [``];
        // exist(config.rarPath, () => {
        //     exist(config.destPath, () => {
        //         execute(cmd);
        //     }, () => {
        //         fs.mkdir(config.destPath, (err) => {
        //             if (err) {
        //                 console.log(err);
        //             } else {
        //                 execute(cmd);
        //             }
        //         });
        //     });
        // });
        return new Promise(function (resolve, reject) {
            exist(config.rarPath, () => {
                    // spawnExec(cmd1,cmd2, resolve);
                    execute(cmd,resolve);
                },
                () => {
                    console.log("rar file doesn't exit");
                }
            )
        })
    }
};

module.exports = rar;