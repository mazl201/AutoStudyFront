var startTime;
var totalTime;
var currentTime;
var nowAudio;
var nowInterval;
var nowEnCnContent;

function translateToENCN(contents) {
    var data = {
        content: contents,
    }
    ;
    $.ajax({
        url: "/sound/translateDst",
        data: data,
        type: "POST",
        // context:null,
        success: function (res) {
            if (res) {
                nowEnCnContent = res;
            }
        }
    })
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
    var calucEnd = (calucIndex + 40)
    if (calucIndex < 0) {
        calucIndex = 0;
    }
    if (calucEnd > contentLength) {
        calucEnd = contentLength;
    }
    // translateToENCN(content)
    $($(nowAudio).parent().find(".contentDis")[0]).html(content.substring(calucIndex, calucEnd) + nowEnCnContent.substring(calucIndex, calucEnd));
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
                var pagesize = 5;
                var currentpage = parseInt(res.page);
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
                //大于一页内容
                if (pagecount > pagesize) {
                    if (currentpage > 1) {
                        pagehtml += '<li class="page-item"><a class="page-link" href="/sound/mp3_list?index=' + (currentpage - 1) + '">上一页</a></li>';
                    }
                    for (var i = 0; i < counts; i++) {
                        if (i >= (currentpage - 3) && i < (currentpage + 3)) {
                            if (i == currentpage - 1) {
                                pagehtml += '<li class="active page-item"><a class="page-link" href="/sound/mp3_list?index=' + (i + 1) + '">' + (i + 1) + '</a></li>';
                            } else {
                                pagehtml += '<li class="page-item"><a class="page-link" href="/sound/mp3_list?index=' + (i + 1) + '">' + (i + 1) + '</a></li>';
                            }

                        }
                    }
                    if (currentpage < counts) {
                        pagehtml += '<li class="page-item"><a class="page-link" href="/sound/mp3_list?index=' + (currentpage + 1) + '">下一页</a></li>';
                    }
                }
                $("#pagination").html(pagehtml);
            }
        }
    }
})


var audios = $("audio");
;
for (var i = 0; i < audios.length;i++) {
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
        $(audios[i]).on("play", function () {
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
            nowInterval = setInterval(freshAudioContent, 1000);
            translateToENCN( $($(nowAudio).parent().find(".content")[0]).html());
        })
        console.log("加载第" + i + "个，完成")
        $(audios[i]).on("pause", function () {
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
            if (startIndex < 0) {
                startIndex = 0;
            }
            if (endIndex > contentLength) {
                endIndex = contentLength;
            }

        })
        // $(audios[i]).on("playing", function () {
        //
        // })

    }

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

$(".voiceMp3Failed").on("click",function(){
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
    }
    ;
    $.ajax({
        url: "/sound/translate",
        data: data,
        type: "POST",
        // context:null,
        success: function (res) {
            if (res) {
                $(nowContentDis).html(res);
            }
        }
    })
}