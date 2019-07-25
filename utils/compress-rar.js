const fs = require('fs');
const exec = require('child_process').exec;

/**
 * 执行cmd
 * @param cmd
 */
function execute(cmd) {
    exec(cmd, {encoding: 'binary'}, function (err, stdout, stderr) {
        if (err) {
            console.log(`err:${err}`);
        }
        if (stderr) {
            console.log(`stderr:${stderr}`);
        }
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
        // let cmd = `rar x ${config.rarPath} ${config.destPath} -y`;
        let cmd = `rar x ${config.rarPath}`;
        exist(config.rarPath, () => {
            exist(config.destPath, () => {
                execute(cmd);
            }, () => {
                fs.mkdir(config.destPath, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        execute(cmd);
                    }
                });
            });
        });
    }
};

module.exports = rar;