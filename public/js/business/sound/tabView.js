/**
 * Created by Administrator on 2019/6/18.
 */
// $(function(){
//     $('#sound-tab a:last').tab('show');//初始化显示哪个tab
//
//     $('#sound-tab a').click(function (e) {
//         e.preventDefault();//阻止a链接的跳转行为
//         $(this).tab('show');//显示当前选中的链接及关联的content
//     })
// })

$('.counter-value').each(function(){
    $(this).prop('Counter',0).animate({
        Counter: $(this).text()
    },{
        duration: 3500,
        easing: 'swing',
        step: function (now){
            $(this).text(Math.ceil(now));
        }
    });
});

$(".showHidden").mouseover(function(){

    $(".showHiddenDiv").show();
})

$(".showHidden").mouseout(function(){

    $(".showHiddenDiv").hide();
})

var nowExternalDiv = $("#footerDivContent");