

$(".submitButton").on("click",function(){

    var data = {content:$(".upload-content").val(),
        spd:$(".myselectionspd").val(),
        per:$(".myselectionper").val()};
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

    // speech.onstart = function(event) {
    //     debugger;
    //     console.log('The utterance started to be spoken.');
    // };
    // speech.onboundary = function(event) {
    //     debugger;
    //     console.log('The utterance started to be spoken.');
    // };
    // speech.onerror = function(event) {
    //     debugger;
    //     console.log('The utterance onerror to be spoken.');
    // };
    if($(".upload-content").val()){
        var contents = $(".upload-content").val().split(/[.,!\?。，？！]/);
        var index = 0;
        //设置朗读内容和属性
        speech.text = contents[index];
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;

        speech.onend = function(event){
            index++;
            if(index >= contents.length){
                return;
            }
            speech.text = contents[index];

            $("#contentDis").html(speech.text);

            window.speechSynthesis.speak(speech);
        }

        window.speechSynthesis.speak(speech);
    }

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