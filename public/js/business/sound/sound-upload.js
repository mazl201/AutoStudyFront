debugger;

$(".submitButton").on("click",function(){
    debugger;
    var data = $(".upload-content").html();
    $.ajax({
        url:"/sound/baidu_api_down",
        data:data,
        // context:null,
        success:function(res){
            var blob = new Blob([res]);
            var a = document.createElement('a');
            a.download = "data.mp3";
            a.href = window.URL.createObjectURL(blob);
            a.click();
            debugger;
        }
    })
})