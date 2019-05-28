debugger;

$(".submitButton").on("click",function(){
    debugger;
    var data = $(".upload-content").html();
    $.ajax({
        url:"/sound/upload-content",
        data:data,
        // context:null,
        success:function(res){
            debugger;
        }
    })
})