var startTime;
var totalTime;
var currentTime;
var nowAudio;
var nowInterval;

function freshAudioContent() {
    layer.msg("当前播放进度(实时)" + nowAudio.currentTime);
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

    $($(nowAudio).parent().find(".contentDis")[0]).html(content.substring(calucIndex, calucEnd));
}


$(".left").on("click",function(){
    $(this).parent().find("img").css("transform","rotate(270deg)")
})
$(".right").on("click",function(){
    $(this).parent().find("img").css("transform","rotate(90deg)")
})
$(".vertical").on("click",function(){
    $(this).parent().find("img").css("transform","rotate(180deg)")
})
$(".origin").on("click",function(){
    $(this).parent().find("img").css("transform","rotate(0deg)")
})

$.ajax({
    url: "/sound/img_list_count" + location.search,
    data: {},
    type: "GET",
    // context:null,
    success: function (res) {

        if (res) {
            if ($("#pagination")) {
                debugger;
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
                        pagehtml += '<li class="page-item"><a class="page-link" href="/sound/img_list?index=' + (currentpage - 1) + '">上一页</a></li>';
                    }
                    for (var i = 0; i < counts; i++) {
                        if (i >= (currentpage - 3) && i < (currentpage + 3)) {
                            if (i == currentpage - 1) {
                                pagehtml += '<li class="active page-item"><a class="page-link" href="/sound/img_list?index=' + (i + 1) + '">' + (i + 1) + '</a></li>';
                            } else {
                                pagehtml += '<li class="page-item"><a class="page-link" href="/sound/img_list?index=' + (i + 1) + '">' + (i + 1) + '</a></li>';
                            }

                        }
                    }
                    if (currentpage < counts) {
                        pagehtml += '<li class="page-item"><a class="page-link" href="/sound/img_list?index=' + (currentpage + 1) + '">下一页</a></li>';
                    }
                }
                $("#pagination").html(pagehtml);
            }
        }
    }
})

//显示大图
function showimage(source)
{
    $("#ShowImage_Form").find("#img_show").html("<image src='"+source+"' class='carousel-inner img-responsive img-rounded' />");
    $("#ShowImage_Form").modal();
}

$(".submitButton").on("click", function () {

    var data = {id: $(this).parent().find(".ids").html()};

    window.location.href = "/sound/img_download?id=" + $(this).parent().find(".ids").html();
})


$(".deleteButton").on("click", function () {

    var data = {id: $(this).parent().find(".ids").html()};
    // window.location.href="/sound/deleteMongoDB?id="+$(this).parent().find(".ids").html();

    $.ajax({
        url: "/sound/deleteMongoDBImg",
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
        debugger;
        for (var i = 0;i < $(".ids").length;i++) {
            if($(".ids")[i]){
                idss += $($(".ids")[i]).html()+","
            }
        }
        // var data = {id: idss};
        debugger;
        $.ajax({
            url: "/sound/clearAllImg",
            data: {id: idss},
            type:"GET",
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