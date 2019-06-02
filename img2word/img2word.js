var httpClient = require("baidu-aip-sdk").HttpClient;
var ocr = require("baidu-aip-sdk").ocr;
var fs = require("fs");

//"16329044", "um4CpIw5abD8si05UUU7bGOg", "TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w"

var APP_ID = '16329044'
var API_KEY = 'um4CpIw5abD8si05UUU7bGOg';
var SECRET_KEY = 'TumiW2FDLxCIEv2Gv2Eq9rVa0VEBG36w';
var client = new ocr(APP_ID,API_KEY,SECRET_KEY);



httpClient.setRequestInterceptor(function (requestOptions) {

    console.log(requestOptions);

    requestOptions.timeout = 5000;

    return requestOptions;
})

var image = fs.readFileSync("public/images/ueditor/1135029736288948224.jpg").toString("base64");


client.generalBasic(image).then(function(result){
    console.log(JSON.stringify(result))
}).catch(function(err){
    console.log(err);
})

module.exports = client

