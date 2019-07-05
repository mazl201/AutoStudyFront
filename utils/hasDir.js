/**
 * Created by Administrator on 2019/7/5.
 */
/**
 * 读取路径信息
 * @param {string} path 路径
 */
function getStat(path) {
    if (path) {
        try {
            fs.statSync(path)
            return true;
        } catch (e) {
            console.log("not directory")
            return false;
        }
    }
}

/**
 * 创建路径
 * @param {string} dir 路径
 */
function mkdir(dir) {
    try {
        fs.mkdirSync(dir);
        return true;
    } catch (e) {
        console.log("directory make failed,please dispose it manually")
        return false;
    }
}

/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
function dirExists(dir) {
    var isExists = getStat(dir);
    //如果该路径且不是文件，返回true
    if (isExists) {
        return true;
    } else if (isExists) {     //如果该路径存在但是文件，返回false
        return false;
    }
    //如果该路径不存在
    var tempDir = paths.parse(dir).dir;      //拿到上级路径
    //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
    var status = dirExists(tempDir);
    var mkdirStatus;
    if (status) {
        mkdirStatus = mkdir(dir);
        return mkdirStatus;
    }
    return mkdirStatus;
}

module.exports = dirExists;