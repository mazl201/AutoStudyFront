debugger;

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