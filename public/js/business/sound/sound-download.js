var startTime;
var totalTime;
var currentTime;
var nowAudio;
var nowInterval;
var nowEnCnContent;
var nowSentences;
var beforeOne;
var beforeTwo = "";
var beforeNo = "";
var nowIndex = 0;
var nextSentence = "";
var pagesize = 5;
var nowPage = 0;

document.addEventListener('copy', function (event) {
    setClipboardText(event);
});

//处理单词
function setClipboardText(event) {
    event.preventDefault();
    var result = window.getSelection(0).toString();

    $.ajax({
        url: "/sound/translateEnEn",
        data: {word: result},
        type: "POST",
        async: true,
        success: function (res) {
            if (res) {
                layer.msg(result + "---" + res, {
                    icon: 6,
                    time: 10000, //2秒关闭（如果不配置，默认是3秒）
                    offset: ['10px', '10px']
                })
            }
        }
    })
    layer.msg(result);
};

function fissionToS(nowEnCnContent) {

    var setences = nowEnCnContent.split(/[.,!\?。，？！]/)

    var returSentences = [];
    var arrIndex = 0;
    for (var index in setences) {
        let sentenceLength = setences[index].length;
        arrIndex = parseInt(arrIndex) + parseInt(sentenceLength) + 1;
        returSentences[arrIndex] = setences[index];
    }

    return returSentences;
}

function translateToENCN(contents) {
    var data = {
        content: contents,
    }

    $.ajax({
        url: "/sound/translateDst",
        data: data,
        type: "POST",
        async: true,
        // context:null,
        success: function (res) {
            if (res) {
                nowEnCnContent = res;

                freshAudioContent();
            }
        }
    })
}

function getFiveSentence(calucIndex) {

    if (beforeOne) {
        beforeTwo = beforeOne
    }

    if (beforeNo) {
        beforeOne = beforeNo;
    }
    for (var startIndex in nowSentences) {
        if(nowIndex > calucIndex){
            nextSentence = nowSentences[startIndex];
            return;
        }
        if (parseInt(startIndex) > parseInt(calucIndex)) {
            let nowSentence = nowSentences[startIndex];
            nowIndex = startIndex;
            beforeNo = nowSentence;
            $.ajax({
                url: "/sound/translate",
                data: {content: beforeNo},
                type: "POST",
                async: false,
                // context:null,
                success: function (res) {
                    if (res) {
                        beforeNo = res;
                    }
                }
            })

        }

    }

    return;
}

function freshAudioContent() {
    // layer.msg("当前播放进度(实时)" + nowAudio.currentTime);
    console.log("总长度（实时）" + nowAudio.duration);
    console.log("总时间" + totalTime);
    console.log("当前进度" + currentTime);
    console.log("开始时间" + startTime);
    console.log("现在时间" + new Date());
    var content = $($(nowAudio).parent().find(".content")[0]).html();
    var contentLength = content.length;
    var calucIndex = parseInt((nowAudio.currentTime / nowAudio.duration) * contentLength) - 10;

    if (calucIndex > nowIndex) {
        //取 5句话 回来
        let fiveSentence = getFiveSentence(calucIndex);
        $("#contentModalDis").html($("#contentModalDis").html() + beforeTwo + "。。<br>" + beforeOne + "。。<br>" + beforeNo+"。。。<br>"+nextSentence);
        var contentDivId = document.getElementById("contentDiv");
        contentDivId.scrollTop = contentDivId.scrollHeight
    }

    var calucEnd = (calucIndex + 40)
    if (calucIndex < 0) {
        calucIndex = 0;
    }
    if (calucEnd > contentLength) {
        calucEnd = contentLength;
    }
    var calucEnd1 = (calucIndex + 100)
    if (calucIndex < 0) {
        calucIndex = 0;
    }
    if (calucEnd1 > contentLength) {
        calucEnd1 = contentLength;
    }

    if (nowEnCnContent) {
        // $("#contentModalDis").html(nowEnCnContent.substring(calucIndex, calucEnd1)+"<br>"+ content.substring(calucIndex, calucEnd));
        $($(nowAudio).parent().find(".contentDis")[0]).html(nowEnCnContent.substring(calucIndex, calucEnd1) + "<br>" + content.substring(calucIndex, calucEnd));
    } else if (content) {

        // $("#contentModalDis").html(content.substring(calucIndex, calucEnd));
        $($(nowAudio).parent().find(".contentDis")[0]).html(content.substring(calucIndex, calucEnd));
    }
}

function fontColorChange1(){
    $("#contentModalDis").attr("color",$("#fontColorId").val())
}
$("#contentModalDis").attr("color",$("#fontColorId").val())
function backgroundColorChange1(){
    $("#contentDiv").attr("style","overflow:auto; height: 350px; width: 100%; border: 1px solid #999;background:"+$("#backgroundColorId").val())
}
$("#contentDiv").attr("style","overflow:auto; height: 350px; width: 100%; border: 1px solid #999;background:"+$("#backgroundColorId").val())
function freshAudioContent1() {
    // layer.msg("当前播放进度(实时)" + nowAudio.currentTime);
    console.log("总长度（实时）" + nowAudio.duration);
    console.log("总时间" + totalTime);
    console.log("当前进度" + currentTime);
    console.log("开始时间" + startTime);
    console.log("现在时间" + new Date());
    var content = $($(nowAudio).parent().parent().find(".content")[0]).html();
    var contentLength = content.length;
    var calucIndex = parseInt((nowAudio.currentTime / nowAudio.duration) * contentLength) - 10;
    var calucEnd = (calucIndex + 40)
    if (calucIndex < 0) {
        calucIndex = 0;
    }
    if (calucEnd > contentLength) {
        calucEnd = contentLength;
    }

    var calucEnd1 = (calucIndex + 100)
    if (calucIndex < 0) {
        calucIndex = 0;
    }
    if (calucEnd1 > contentLength) {
        calucEnd1 = contentLength;
    }

    if (calucIndex > nowIndex) {
        //取 5句话 回来
        let fiveSentence = getFiveSentence(calucIndex);

        $("#contentModalDis").html($("#contentModalDis").html() + beforeTwo + "。。<br>" + beforeOne + "。。<br>" + beforeNo+"。。。<br>"+nextSentence);
        var contentDivId = document.getElementById("contentDiv");
        contentDivId.scrollTop = contentDivId.scrollHeight
    }

    // $("#contentModalDis").html(nowEnCnContent.substring(calucIndex, calucEnd1) + "<br>" + content.substring(calucIndex, calucEnd));
    // $("#footerDivContent").html(calucEnd1 + "<br>" + content.substring(calucIndex, calucEnd));
    $($(nowAudio).parent().find(".contentDis")[0]).html(nowEnCnContent.substring(calucIndex, calucEnd1) + "<br>" + content.substring(calucIndex, calucEnd));
}


$(".left").on("click", function () {
    $(this).parent().find("img").css("transform", "rotate(270deg)")
})
$(".right").on("click", function () {
    $(this).parent().find("img").css("transform", "rotate(90deg)")
})
$(".vertical").on("click", function () {
    $(this).parent().find("img").css("transform", "rotate(180deg)")
})
$(".origin").on("click", function () {
    $(this).parent().find("img").css("transform", "rotate(0deg)")
})

$.ajax({
    url: "/sound/mp3_list_count" + location.search,
    data: {},
    type: "GET",
    // context:null,
    success: function (res) {

        if (res) {
            if ($("#pagination")) {

                var pagecount = res.total;
                // var pagesize = 5;
                var currentpage = parseInt(res.page);
                nowPage = currentpage;
                console.log("当前页为 &&&&"+currentpage);
                var counts, pagehtml = "";
                if (pagecount % pagesize == 0) {
                    counts = parseInt(pagecount / pagesize);
                } else {
                    counts = parseInt(pagecount / pagesize) + 1;
                }
                //只有一页内容
                if (pagecount <= pagesize) {
                    pagehtml = "";
                }

                var nowFileNamev = $(window.parent.document.getElementById("presentFileName")).attr("var");
                //大于一页内容
                if (pagecount > pagesize) {
                    // window.parent
                    if (currentpage > 1) {
                        pagehtml += '<li class="page-item"><a class="page-link" href="/sound/mp3_list?fileName=' + nowFileNamev + '&index=' + (currentpage - 1) + '">上一页</a></li>';
                    }
                    for (var i = 0; i < counts; i++) {
                        if (i >= (currentpage - 3) && i < (currentpage + 3)) {
                            if (i == currentpage - 1) {
                                pagehtml += '<li class="active page-item"><a class="page-link" href="/sound/mp3_list?fileName=' + nowFileNamev + '&index=' + (i + 1) + '">' + (i + 1) + '</a></li>';
                            } else {
                                pagehtml += '<li class="page-item"><a class="page-link" href="/sound/mp3_list?fileName=' + nowFileNamev + '&index=' + (i + 1) + '">' + (i + 1) + '</a></li>';
                            }

                        }
                    }
                    if (currentpage < counts) {
                        pagehtml += '<li class="page-item"><a class="page-link" href="/sound/mp3_list?fileName=' + nowFileNamev + '&index=' + (currentpage + 1) + '">下一页</a></li>';
                    }
                }
                $("#pagination").html(pagehtml);
            }
        }
    }
})


var audios = $("audio");
;
for (var i = 0; i < audios.length; i++) {
    if ($(audios[i])) {
        // $(audios[i]).on("canplay",function(){
        //     var audioName = $(this).attr("name");
        //     console.log(audioName+"可以开始播放")
        //     $(this).show();
        // })
        // $(audios[i]).on("canplaythrough", function () {
        //
        // })
        console.log("加载第" + i + "个")
        var audioNow = audios[i]
        initAudioClick(audioNow)

        // $(audios[i]).on("playing", function () {
        //
        // })

    }

}

function initAudioClick(audioNow) {
    $(audioNow).on("play", function () {
        $("#audioSpeedId").val();
        this.playbackRate = $("#audioSpeedId").val();
        console.log("当前播放速度 === "+this.playbackRate)
        var audioName = $(this).attr("name");
        console.log(audioName + "开始播放")
        console.log(audioName + "当前播放进度" + this.currentTime)
        console.log(audioName + "总长度" + this.duration)
        var number = this.currentTime / this.duration;
        console.log(audioName + "百分比" + number * 100)
        var contentLength = $($(this).parent().find(".content")[0]).html().length;
        console.log(audioName + "目前字数" + parseInt(contentLength * number))

        currentTime = this.currentTime;
        totalTime = this.duration;
        startTime = new Date();
        nowAudio = this;
        // translateToENCN($($(nowAudio).parent().find(".content")[0]).html());
        nowSentences = fissionToS($($(nowAudio).parent().find(".content")[0]).html());
        nowInterval = setInterval(freshAudioContent, 2000);
    })
    console.log("加载第" + i + "个，完成")
    $(audioNow).on("pause", function () {
        var audioName = $(this).attr("name");
        console.log(audioName + "暂停播放")
        console.log(audioName + "当前播放进度" + this.currentTime)
        console.log(audioName + "总长度" + this.duration)
        var number = this.currentTime / this.duration;
        console.log(audioName + "百分比" + number * 100)
        var contentLength = $($(this).parent().find(".content")[0]).html().length;
        console.log(audioName + "目前字数" + parseInt(contentLength * number))
        var startIndex = 0;
        var endIndex = 30;
        clearInterval(nowInterval);
        nowEnCnContent = "";
        beforeNo = "";
        beforeOne = "";
        beforeTwo = "";
        nowSentences = "";

        if (startIndex < 0) {
            startIndex = 0;
        }
        if (endIndex > contentLength) {
            endIndex = contentLength;
        }
    })

    $(audioNow).on("ended", function () {
        console.log("第" + i + "个，音频结束了。");
        debugger;
        let indexOfAudio = parseInt($(this).attr("id").replace("audioindex-",""));

        if(indexOfAudio < pagesize - 1){
            document.getElementById("audioindex-"+(indexOfAudio+1)).play();
        }else if(indexOfAudio == (pagesize -1)){

            setTimeout(function(){
                nowPage = nowPage + 1;
                var nowFileNamev = $(window.parent.document.getElementById("presentFileName")).attr("var");
                window.location.href = '/sound/mp3_list?fileName=' + nowFileNamev + '&index=' + nowPage;
            },5000)
        }

        nowEnCnContent = "";
        beforeNo = "";
        beforeOne = "";
        beforeTwo = "";
        nowSentences = "";
        nowIndex = 0;





    })
}
$("#pauseAudio").on("click",function(){
    debugger;
    nowAudio.pause();
})


$("#resumeAudio").on("click",function(){
    debugger;
    nowAudio.play();
})

function initAudioClick1(audioNow) {
    $(audioNow).on("play", function () {

        $("#audioSpeedId").val();
        this.playbackRate = $("#audioSpeedId").val();

        nowAudio = this;
        // translateToENCN(content)
        nowInterval = setInterval(freshAudioContent1, 1000);
        nowSentences = fissionToS($($(nowAudio).parent().find(".content")[0]).html());
        // translateToENCN($($(nowAudio).parent().find(".contentvoice")[0]).html());
    })
    console.log("加载第" + i + "个，完成")
    $(audioNow).on("pause", function () {
        clearInterval(nowInterval);
        nowEnCnContent = "";
        beforeNo = "";
        beforeOne = "";
        beforeTwo = "";
        nowSentences = "";
    })
}

//显示大图
function showimage(source) {
    $("#ShowImage_Form").find("#img_show").html("<image src='" + source + "' class='carousel-inner img-responsive img-rounded' />");
    $("#ShowImage_Form").modal();
}

$(".submitButton").on("click", function () {

    var data = {id: $(this).parent().find(".ids").html()};

    window.location.href = "/sound/mp3_download?id=" + $(this).parent().find(".ids").html();
})


$(".deleteButton").on("click", function () {

    var data = {id: $(this).parent().find(".ids").html()};
    // window.location.href="/sound/deleteMongoDB?id="+$(this).parent().find(".ids").html();

    $.ajax({
        url: "/sound/deleteMongoDB",
        data: {id: $(this).parent().find(".ids").html()},
        // type:"GET",
        // context:null,
        success: function (res) {

            if (res == "success") {
                window.location.reload();
            } else if (res == "failed") {
                alert("删除报错");
            }
        }
    })
})

$(".clearAllButton").on("click", function () {

    var confirmMsg = confirm("确认清空 吗？");

    if (confirmMsg == true) {
        var idss = "";

        for (var i = 0; i < $(".ids").length; i++) {
            if ($(".ids")[i]) {
                idss += $($(".ids")[i]).html() + ","
            }
        }
        // var data = {id: idss};

        $.ajax({
            url: "/sound/clearAll",
            data: {id: idss},
            type: "GET",
            // context:null,
            success: function (res) {

                if (res == "success") {
                    window.location.reload();
                } else if (res == "failed") {
                    alert("删除报错");
                }
            }
        })
    }
})


$(".flushAllButton").on("click", function () {

    location.reload()
})

var nowContentDis;
var nowRetry;
$(".retryTranslate").on("click", function () {
    layer.msg("来自手机 浏览器 尝试重新发起请求");
    nowRetry = this;
    $.ajax({
        url: "/sound/retry_baidu_api_down",
        data: {
            "content": $(this).parent().find("p").html(),
            "filename": $(this).parent().parent().find(".submitButton").html().replace(".mp3", "")
        },
        type: "POST",
        success: function (res) {
            if (res) {
                $(nowRetry).parent().append("<audio src=\"mp3_download?id=" + res + "\" name=\"temperarory  2019-06-30 13:55:29.mp3\" controls=\"\">undefined@@000000  2019-06-30 13:55:29.mp3</audio>");
                // $(nowRetry).remove();
                var find = $(nowRetry).parent().find("audio");
                initAudioClick1(find);
            }
        }
    })
})

$(".allFailedFlush").on("click", function () {
    var $retryTranslate = $(".retryTranslate");
    if ($retryTranslate) {
        for (var i = 0; i < $retryTranslate.length - 1; i++) {
            $($retryTranslate[i]).click();
        }
    }
})

$(".voiceMp3Failed").on("click", function () {
    nowContentDis = $(this).parent().find(".contentDis");

    var speech = new SpeechSynthesisUtterance();

    var content = $(this).parent().find("p").html();
    var contents = content.split(/[.,!\?。，？！]/);
    ;
    var index = 0;
    //设置朗读内容和属性
    speech.text = contents[index];
    // $("#contentDis").html(speech.text);
    translateToENCN2(speech.text);
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    speech.onend = function (event) {
        index++;
        if (index >= contents.length) {
            return;
        }
        speech.text = contents[index];

        // $("#contentDis").html(speech.text);
        translateToENCN2(speech.text);
        window.speechSynthesis.speak(speech);
    }

    window.speechSynthesis.speak(speech);
})

function translateToENCN2(text) {
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

                $(nowContentDis).html(res);
                // $(parent.window.document.getElementById("footerDivContent")).html(res);
                $("#footerDivContent").html(res);
            }
        }
    })
}


function launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

function isFullscreen() {
    if (navigator.userAgent.indexOf("Firefox") != -1) {
        return document.mozFullScreen;
    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
        return document.webkitIsFullScreen;
    }
    return document.fullscreen;
}