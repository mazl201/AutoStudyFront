var notReadContents = [];
var readedContents = [];
$(".submitButton").on("click", function () {

    var data = {
        content: $(".upload-content").val(),
        spd: $(".myselectionspd").val(),
        per: $(".myselectionper").val()
    };
    $(".upload-content").attr("disabled", true);
    $(".submitButton").attr("disabled", true);
    $.ajax({
        url: "/sound/baidu_api_down",
        data: data,
        type: "POST",
        // context:null,
        success: function (res) {

            if (res == "success") {
                $(".upload-content").attr("disabled", false);
                $(".submitButton").attr("disabled", false);
                $(".upload-content").val("")
            } else if (res == "failed") {
                alert("内容为空")
                $(".upload-content").attr("disabled", false);
                $(".submitButton").attr("disabled", false);
                $(".upload-content").val("")
            }
        }
    })
})

function pauseOrResume1(){
    if(window.speechSynthesis.paused){
        window.speechSynthesis.resume();
    }else{
        window.speechSynthesis.pause();
    }
}

$(".translateButton").on("click", function () {

    var data = {
        content: $(".upload-content").val(),
        spd: $(".myselectionspd").val(),
        per: $(".myselectionper").val()
    };
    // $(".upload-content").attr("disabled", true);
    // $(".submitButton").attr("disabled", true);
    $.ajax({
        url: "/sound/en_cn_trans",
        data: data,
        type: "POST",
        // context:null,
        success: function (res) {

            if(res.indexOf("success") > -1){
                window.location.href = "/sound/downloadTxt?path=" + res.replace("success","");
            }
        }
    })
})

$('.selectpicker').selectpicker();

function translateToENCN1(text) {
    var data = {
            content: text,
        };
    $.ajax({
        url: "/sound/translate",
        data: data,
        type: "POST",
        // context:null,
        success: function (res) {
            if (res) {
                $("#contentDis").html(res);
            }
        }
    })
}


$(".voiceButton").on("click", function () {
    var speech = new SpeechSynthesisUtterance();
    if ($(".upload-content").val()) {
        debugger;
        var contents = $(".upload-content").val().split(/[.,!\?。，？！]/);
        var index = 0;
        //设置朗读内容和属性
        speech.text = contents[index];
        readedContents.push(contents.splice(0,1));
        notReadContents = contents;
        // $("#contentDis").html(speech.text);
        translateToENCN1(speech.text);
        speech.volume = 1;
        debugger;
        speech.rate = $("#speechSpdId").val();
        speech.pitch = 1;

        if(speech.onend){
            speech.onend = function (event) {
                // index++;
                if (!notReadContents.length) {
                    return;
                }
                speech.text = contents[index];
                readedContents.push(contents.splice(0,1));
                notReadContents = contents;

                // $("#contentDis").html(speech.text);
                translateToENCN1(speech.text);
                window.speechSynthesis.speak(speech);
            }
        }else{
            layer.msg("speech deploy failed")
        }


        window.speechSynthesis.speak(speech);
    }

})

function goOnToNextSentence(speech1) {
    var index = 0;
    var contents = notReadContents;
    speech1.text = contents[index];
    //设置朗读内容和属性
    readedContents.push(contents.splice(index, 1));
    notReadContents = contents;

    // $("#contentDis").html(speech.text);
    translateToENCN1(speech1.text);
    speech1.volume = 1;
    debugger;
    speech1.rate = $("#speechSpdId").val();
    speech1.pitch = 1;

    if (speech1.onend) {
        speech1.onend = function (event) {
            // index++;
            if (!notReadContents.length) {
                return;
            }
            speech1.text = contents[0];
            readedContents.push(contents.splice(0, 1));
            notReadContents = contents;

            // $("#contentDis").html(speech.text);
            translateToENCN1(speech1.text);
            window.speechSynthesis.speak(speech1);
        }
    } else {
        layer.msg("speech deploy failed")
    }
    window.speechSynthesis.speak(speech1);
}

$(".continueVoice").on("click",function(){
    var speech1 = new SpeechSynthesisUtterance();
    if(notReadContents){
        goOnToNextSentence(speech1);
    }
})

$(".previousVoice").on("click",function(){
    var speech1 = new SpeechSynthesisUtterance();
    if(readedContents && readedContents.length){
        debugger;
        notReadContents.splice(0,0,readedContents[readedContents.length-1])
        readedContents.splice(readedContents.length-1,1)
        notReadContents.splice(0,0,readedContents[readedContents.length-1])
        readedContents.splice(readedContents.length-1,1)
        goOnToNextSentence(new SpeechSynthesisUtterance())
    }
})

$(".uploadFileButton").on("click", function () {
    var form = new FormData();
    var file = document.getElementById("fileId").files[0];
    if (file && file.size > 0) {
        form.append('file', file);
        // form.append('file', file);
        $.ajax({
            // url:"http://localhost:3005",
            url: "/sound/translateFile",
            data: form,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (res) {
                if(res.indexOf("success") > -1){
                    window.location.href = "/sound/downloadTxt?path=" + res.replace("success","");
                }
            }
        })
    }
})

var inputFile = $("#input-id").fileinput({
    'showUpload': true, 'previewFileType': 'any', 'uploadUrl': "/sound/uploadFile", "uploadExtraData": function () {

        return {spd: $("#myFilespd").val()}
    }
});

// function myFileSpdChange() {
//     inputFile.refresh({
//         'showUpload': true, 'previewFileType': 'any', 'uploadUrl': "/sound/uploadFile", "uploadExtraData": function () {
//
//             return {spd: $("#myFilespd").val()}
//         }
//     });
// }