debugger;

$(function(){
    debugger;
    var audios = $("audio");
    for(var i in audios){
        if($(audios[i])){
            $(audios[i]).on("canplay",function(){
                var audioName = $(this).attr("name");
                console.log(audioName+"可以开始播放")
                $(this).show();
            })
            $(audios[i]).on("play",function(){
                var audioName = $(this).attr("name");
                console.log(audioName+"开始播放")
                console.log(audioName + "当前播放进度"+this.currentTime)
                console.log(audioName + "总长度"+this.duration)
                var number = this.currentTime/this.duration;
                console.log(audioName + "百分比"+ number*100)
                var contentLength = $(this).parent().find(".content").val().length;
                console.log(audioName + "目前字数"+parseInt(contentLength*number))

            })
            $(audios[i]).on("pause",function(){
                var audioName = $(this).attr("name");
                console.log(audioName+"暂停播放")
                console.log(audioName + "当前播放进度"+this.currentTime)
                console.log(audioName + "总长度"+this.duration)
                var number = this.currentTime/this.duration;
                console.log(audioName + "百分比"+ number*100)
                var contentLength = $(this).parent().find(".content").val().length;
                console.log(audioName + "目前字数"+parseInt(contentLength*number))
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


    // $.ajax({
    //     url:"/sound/mp3_download",
    //     data:data,
    //     type:'POST',
    //     // context:null,
    //     success:function(res){
    //         var blob = new Blob([res]);
    //         var a = document.createElement('a');
    //         a.download = "data.mp3";
    //         a.href = window.URL.createObjectURL(blob);
    //         a.click();
    //         debugger;
    //     }
    // })
})