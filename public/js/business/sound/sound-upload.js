debugger;

$(".submitButton").on("click",function(){
    debugger;
    var data = {content:$(".upload-content").val()};
    $(".upload-content").attr("disabled",true);
    $(".submitButton").attr("disabled",true);
    $.ajax({
        url:"/sound/baidu_api_down",
        data:data,
        type:"POST",
        // context:null,
        success:function(res){
           if(res == "success"){
               $(".upload-content").attr("disabled",false);
               $(".submitButton").attr("disabled",false);
               $(".upload-content").val("")
           }else if(res == "failed"){
                alert("内容为空")
               $(".upload-content").attr("disabled",false);
               $(".submitButton").attr("disabled",false);
               $(".upload-content").val("")
            }
        }
    })
})

$(".voiceButton").on("click",function(){
    debugger;
    var speech = new SpeechSynthesisUtterance();

    //设置朗读内容和属性
    speech.text = $(".upload-content").val();
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
})

$(".uploadFileButton").on("click",function(){
    var form = new FormData();
    var file = document.getElementById("fileId").files[0];
    if (file && file.size > 0) {
        form.append('file', file);
        // form.append('file', file);
        $.ajax({
            // url:"http://localhost:3005",
             url:"/sound/uploadFile",
            data:form,
            type:"POST",
            processData: false,
            contentType: false,
            success:function(res){
                alert(res);
            }})
    }
})