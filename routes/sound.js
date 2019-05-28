var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/upload', function(req, res, next) {
    var content = new Array("1","2","3","4","5")

    res.render('sound-upload', { title: 'sound-upload-transferword-to-mp3',content:content});
});

module.exports = router;