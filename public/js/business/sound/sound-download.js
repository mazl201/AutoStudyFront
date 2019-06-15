debugger;
var startTime;
var totalTime;
var currentTime;
var nowAudio;
var nowInterval;

function freshAudioContent(){
    console.log( "当前播放进度(实时)"+nowAudio.currentTime);
    console.log( "总长度（实时）"+nowAudio.duration);
    console.log("总时间"+totalTime);
    console.log("当前进度"+currentTime);
    console.log("开始时间"+startTime);
    console.log("现在时间"+new Date());
    var content = $($(nowAudio).parent().find(".content")[0]).html();
    var contentLength = content.length;
    var calucIndex = parseInt((nowAudio.currentTime/nowAudio.duration)*contentLength)-10;
    var calucEnd = (calucIndex + 40)
    if(calucIndex < 0){
        calucIndex = 0;
    }
    if(calucEnd > contentLength){
        calucEnd = contentLength;
    }
    debugger;
    $($(nowAudio).parent().find(".contentDis")[0]).html(content.substring(calucIndex,calucEnd));
}


$(function(){
    debugger;
    var audios = $("audio");
    for(var i in audios){
        if($(audios[i])){
            // $(audios[i]).on("canplay",function(){
            //     var audioName = $(this).attr("name");
            //     console.log(audioName+"可以开始播放")
            //     $(this).show();
            // })
            $(audios[i]).on("play",function(){
                var audioName = $(this).attr("name");
                console.log(audioName+"开始播放")
                console.log(audioName + "当前播放进度"+this.currentTime)
                console.log(audioName + "总长度"+this.duration)
                var number = this.currentTime/this.duration;
                console.log(audioName + "百分比"+ number*100)
                var contentLength = $($(this).parent().find(".content")[0]).html().length;
                console.log(audioName + "目前字数"+parseInt(contentLength*number))
                currentTime = this.currentTime;
                totalTime = this.duration;
                startTime = new Date();
                nowAudio =this;
                nowInterval = setInterval(freshAudioContent,1000);
            })

            $(audios[i]).on("pause",function(){
                var audioName = $(this).attr("name");
                console.log(audioName+"暂停播放")
                console.log(audioName + "当前播放进度"+this.currentTime)
                console.log(audioName + "总长度"+this.duration)
                var number = this.currentTime/this.duration;
                console.log(audioName + "百分比"+ number*100)
                var contentLength = $($(this).parent().find(".content")[0]).html().length;
                console.log(audioName + "目前字数"+parseInt(contentLength*number))
                var startIndex = 0;
                var endIndex = 30;
                clearInterval(nowInterval);
                if(startIndex < 0){
                    startIndex = 0;
                }
                if(endIndex > contentLength){
                    endIndex = contentLength;
                }

            })
            $(audios[i]).on("playing",function(){

            })
        }

    }
})

$(".submitButton").on("click",function(){
    debugger;
    var data = {id : $(this).parent().find(".ids").html()};

    window.location.href="/sound/mp3_download?id="+$(this).parent().find(".ids").html();
})


$(".deleteButton").on("click",function(){
    debugger;
    var data = {id : $(this).parent().find(".ids").html()};
    // window.location.href="/sound/deleteMongoDB?id="+$(this).parent().find(".ids").html();

    $.ajax({
        url:"/sound/deleteMongoDB",
        data:{id:$(this).parent().find(".ids").html()},
        // type:"GET",
        // context:null,
        success:function(res){
            debugger;
            if(res == "success"){
                window.location.reload();
            }else if(res == "failed"){
                alert("删除报错");
            }
        }
    })
})


$(".clearAllButton").on("click",function(){

    var confirmMsg = confirm("确认清空 吗？");

    if(confirmMsg == true){
        var data = {id : $(this).parent().find(".ids").html()};
        // window.location.href="/sound/deleteMongoDB?id="+$(this).parent().find(".ids").html();

        $.ajax({
            url:"/sound/clearAll",
            data:{id:$(this).parent().find(".ids").html()},
            // type:"GET",
            // context:null,
            success:function(res){
                debugger;
                if(res == "success"){
                    window.location.reload();
                }else if(res == "failed"){
                    alert("删除报错");
                }
            }
        })
    }else{

    }

})