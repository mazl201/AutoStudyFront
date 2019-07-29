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

$('.counter-value').each(function () {
    $(this).prop('Counter', 0).animate({
        Counter: $(this).text()
    }, {
        duration: 3500,
        easing: 'swing',
        step: function (now) {
            $(this).text(Math.ceil(now));
        }
    });
});

$(".everyFileName").click(function () {
    debugger;
    let fileName = $(this).find(".title").html();

    $("#presentFileName").html("当前选中 " + fileName);

    $("#mp3AlterIframe").attr("src", "/sound/mp3_list?" + "fileName=" + fileName);
    $("#presentFileName").attr("var", fileName);
})

$(".showHidden").mouseover(function () {

    $(".showHiddenDiv").show();
})

$("#closeCountss").click(function () {
    $(".showHiddenDiv").hide();
})

/*$(".showHiddenDiv").mouseout(function(){
    debugger;
    $(".showHiddenDiv").hide();
})*/

//全屏按钮上调用的方法
function showFullScreen() {
    var elm = document.getElementById("fullScreen");
    launchFullscreen(elm);
}

//全屏按钮上调用的方法
function showFullScreen1() {
    var elm = document.getElementById("fullScreen1");
    launchFullscreen(elm);
}

//全屏按钮上调用的方法
function showFullScreen2() {
    var elm = document.getElementById("mp3AlterIframe");
    launchFullscreen(elm);
}

//全屏按钮上调用的方法
function showFullScreen3() {
    var elm = document.getElementById("fullScreen3");
    launchFullscreen(elm);
}

//全屏按钮上调用的方法
function showFullScreen4() {
    var elm = document.getElementById("fullScreen4");
    launchFullscreen(elm);
}

// 全屏，退出按esc或参考参考参考注释代码写退出全屏按钮
function launchFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();//ie浏览器
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen();//谷歌浏览器
    }
}

// 监听全屏事件webkitfullscreenchange是谷歌内核的事件；MSFullscreenChange是ie内核的事件
document.addEventListener('webkitfullscreenchange', function fullscreenChange() {
    if (document.fullscreenEnabled ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement) {
        console.log('enter fullscreen');
        //可以在这里做一些全屏时的事
    } else {
        console.log('exit fullscreen');
        //可以在这里做一些退出全屏时的事
    }
});

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (
        document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

// var btn = document.querySelector('#button');
// if (fullscreenEnabled) {
//     btn.addEventListener('click', function () {
//         var fullscreenElement = document.fullscreenElement ||
//             document.mozFullScreenElement ||
//             document.webkitFullscreenElement;
//         if (fullscreenElement) {
//             exitFullscreen();
//             btn.innerHTML = '全屏';
//         } else {
//             launchFullscreen(document.documentElement);
//             btn.innerHTML = '退出全屏';
//         }
//     }, false);
// }

var nowExternalDiv = $("#footerDivContent");