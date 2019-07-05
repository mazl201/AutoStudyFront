var exec = require('child_process').exec;
var tmp = require('tmp');
var fs = require('fs');
var filesource = require('filesource');
var initialized = false;
var pdfPageCount = require("./pdfPageCount.js");

// Add Ghostscript executables path
var projectPath = __dirname.split("\\");
projectPath.pop();
projectPath = projectPath.join("\\");

exports.ghostscriptPath = projectPath + "\\executables\\ghostScript";
console.log(exports.ghostscriptPath);
// for linux compability
exports.ghostscriptPath = exports.ghostscriptPath.split("\\").join("/");

function getPageCount(callback, filepathOrData) {
    pdfPageCount.count(filepathOrData, function (resp2) {
        if (!resp2.success) {
            console.log("Something went wrong: " + resp2.error);

            return;
        }
        callback(resp2);
    });
};


function getImage(callback, options, imageFilepath, resp, i) {
    return new Promise(function (resolve, reject) {
        console.log("start exec ghost cmd");

        console.log("gs -dQUIET -dPARANOIDSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r" +
            options.quality +
            " -dFirstPage=" + i +
            " -dLastPage=" + i +
            " -sOutputFile=" + imageFilepath +
            " " +
            '"' + resp.data + '"')

        exec("gs -dQUIET -dPARANOIDSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r" +
            options.quality +
            " -dFirstPage=" + i +
            " -dLastPage=" + i +
            " -sOutputFile=" + imageFilepath +
            " " +
            '"' + resp.data + '"', function (error, stdout, stderr) {
            // Remove temp files
            resp.clean();

            if (error !== null) {

                reject({success: false, error: "Error converting pdf to png: " + error});
                return;
            }

            if (options.returnFilePath) {
                resolve({success: true, data: imageFilepath});
                return;
            }

            var img = fs.readFileSync(imageFilepath);

            // Remove temp file
            console.log(imageFilepath);
            fs.unlinkSync(imageFilepath);

            resolve({success: true, data: img, number: i});
        });
    })

}

exports.convert = function () {

    var filepathOrData = arguments[0];
    //return;
    var callback = arguments[1];

    var options = {};

    var tmpFileCreated = false;

    if (arguments[2] != null) {
        options = arguments[1];
        callback = arguments[2];
    }

    if (!initialized) {
        if (!options.useLocalGhostscript) {
            process.env.Path += ";" + exports.ghostscriptPath;
        }

        initialized = true;
    }

    options.quality = options.quality || 100;

    filesource.getDataPath(filepathOrData, function (resp) {
        if (!resp.success) {
            callback(resp);
            return;
        }

        getPageCount(function (resp2) {
            // get temporary filepath
            console.log("get pdf page")
            if (resp2.data) {
                var totalPage = resp2.data;
                var number = totalPage / 80;
                console.log("get number **" + number)
                // for (var jj = 0; jj <= number; jj++) {
                //     var start = jj * 80 + 1;
                //     var end = (jj + 1) * 80;
                //     if (start > totalPage) {
                //         return;
                //     }
                //     if (end > totalPage) {
                //         end = totalPage;
                //     }
                // console.log("start for each for " + start + "---" + end);
                for (var i = 1; i <= totalPage; i++) {

                    var result = new Object();
                    result.data = [];
                    var her = 1;
                    tmp.file({postfix: ".png"}, function (err, imageFilepath, fd) {
                        console.log("enter tmp file func");
                        if (err) {
                            callback({success: false, error: "Error getting second temporary filepath: " + err});
                            return;
                        }
                        console.log("enter tmp file func second");
                        var getImageCall = async function () {
                            console.log("enter waiting callback")
                            var imagePromise = getImage(function (resp3) {
                                //result.data.push(resp3.data);
                                result.data = resp3.data;
                                result.imgNum = resp3.number;
                                result.success = resp3.success;
                            }, options, imageFilepath, resp, her++);
                            let result = await imagePromise;
                            callback(result1);
                        }
                        console.log("start function callback")
                        let result1 = getImageCall()
                        console.log("getted function callback")
                        console.log("result2"+result1)


                    });


                }
                // }
            }

        }, filepathOrData);

    });
};
