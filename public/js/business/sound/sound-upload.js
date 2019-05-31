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