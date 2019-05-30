/**
 * Created by Administrator on 2019/5/30.
 */
//fileserver.js

var http = require("http"),
    url = require("url"),
    mongo = require('mongodb'),
    path = require("path"),
    ObjectID = require('mongodb').ObjectID,
    Grid = require('gridfs-stream'),
    gridform = require('gridform'),
    fs = require("fs"),
    GridStore = require('mongodb').GridStore;


function FileServer(db) {
    if (!(this instanceof FileServer)) return new FileServer(db);
    this.db = db;
}

FileServer.prototype.start = function start(listenport) {
    var me = this;
    me.db.open(function(err) {
        if (err) {
            console.log(err);
            return;
        }
        app.listen(listenport, "127.0.0.1");
        console.log("Server running at http://127.0.0.1:" + listenport);

    });

    var app = http.createServer(function(req, res) {

        var pathname = url.parse(req.url).pathname;
        //upload////////////////////////////////////////////////////
        if (pathname.indexOf('/upload') >= 0 && 'POST' == req.method) {
            gridform.db = me.db;
            gridform.mongo = mongo;
            var outObj;
            var form = gridform();
            form.parse(req, function(err, fields, files) {
                if (err) {
                    outObj = {
                        "status": 0,
                        "message": err
                    }

                } else {
                    for (var obj in files) {
                        outObj = {
                            status: 1,
                            data: {
                                name: files[obj].name,
                                id: files[obj].id.toString(),
                                url: 'http://' + req.headers.host + '/id/' + files[obj].id.toString()
                            }
                        };
                    }

                }
                console.log('received upload..');
                me.responMsg(res, 200, JSON.stringify(outObj));
            });

        } else if (pathname != '/') { //download///////////////////////////////////////
            var filename, fileId, delPos, idPos, strId;

            delPos = pathname.indexOf('/delete/');
            idPos = pathname.indexOf('/id/');
            //通过ID匹配文件
            if (idPos >= 0) {
                strId = pathname.substr(idPos + 4, pathname.length - idPos + 1);
                filename = {
                    _id: strId
                };
                fileId = ObjectID(strId);
            } else {
                filename = pathname.replace('/', '');
            }
            console.log('get file:' + filename);
            //优先查找磁盘中的文件
            var realPath = "files" + pathname;


            path.exists(realPath, function(exists) {
                if (exists) {
                    fs.readFile(realPath, "binary", function(err, file) {
                        if (err) {
                            me.responMsg(res, 500, err);
                        } else {
                            var ext = path.extname(realPath);
                            ext = ext ? ext.slice(1) : 'unknown';
                            var contentType = mime[ext] || "text/plain";
                            res.writeHead(200, {
                                'Content-Type': contentType
                            });
                            res.write(file, "binary");
                            res.end();
                        }
                    });
                } else {
                    // Verify that the file exists
                    me.exist(me.db, fileId || filename, function(err, result, item) {
                        if (!result) {
                            me.responMsg(res, 404, "文件不存在");
                            return;
                        }
                        if (delPos >= 0) {
                            GridStore.unlink(me.db, item._id, function(err) {
                                me.responMsg(res, 200, 'success')
                            });
                        } else {
                            var gfs = Grid(me.db, mongo);
                            var readstream = gfs.createReadStream(filename);
                            var ext = item.filename.split('.');
                            ext = ext ? ext[ext.length-1] : 'unknown';
                            var contentType = mime[ext] || "text/plain";

                            res.setHeader("Content-Type", contentType);
                            readstream.pipe(res);
                        }
                    });
                }
            });

        } else {
            res.setHeader("Content-Type", "text/html");
            res.end(
                '<form method="post" action="/upload" enctype="multipart/form-data">' + '<input type="file" name="text">' + '<input type="submit" value="upload">' + '</form>');
        }


    });
}

FileServer.prototype.responMsg = function responMsg(response, status, msg) {
    response.writeHead(status, {
        'Content-Type': 'text/plain;charset=utf-8'
    });

    response.end(msg);
}

//覆盖了驱动里原始的exist方法，将找到的item也返回来
FileServer.prototype.exist = function exist(db, fileIdObject, rootCollection, callback) {
    var args = Array.prototype.slice.call(arguments, 2);
    callback = args.pop();
    rootCollection = args.length ? args.shift() : null;

    // Fetch collection
    var rootCollectionFinal = rootCollection != null ? rootCollection : GridStore.DEFAULT_ROOT_COLLECTION;
    db.collection(rootCollectionFinal + ".files", function(err, collection) {
        // Build query
        var query = (typeof fileIdObject == 'string' || Object.prototype.toString.call(fileIdObject) == '[object RegExp]') ? {
            'filename': fileIdObject
        } : {
            '_id': fileIdObject
        }; // Attempt to locate file
        collection.find(query, function(err, cursor) {
            cursor.nextObject(function(err, item) {
                callback(null, item == null ? false : true, item);
            });
        });
    });
};

var mime = {

    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

};

module.exports = exports = FileServer;