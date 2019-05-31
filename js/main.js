document.onreadystatechange = function () {
    var state = document.readyState
    if (state == 'complete') {
        document.querySelector("#opening").style.cssText = 'opacity: 0; transition: 0.3s;';
        setTimeout(function(){
            document.querySelector("#opening").style.display = 'none';
            init();
            noneInit();
            crtTime();
        }, 1000);
    }
}

var width, height;

width = window.innerWidth;
height = window.innerHeight;

function init(){
    window.addEventListener('resize', onWindowResize, false);
}
function noneInit(){
    imageSlide();

    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');
    
    $('#apps').css({
        'transform' : 'translate(0px, 0px)',
        'opacity' : '1'
    });

    $('#slideWrap img:gt(0)').hide();
    $('#bgSlideWrap img:gt(0)').hide();
    function imageSlide(){
        $('#slideWrap img:first').fadeOut(500).next().show().end().appendTo('#slideWrap');
        $('#bgSlideWrap img:first').fadeOut(500).next().show().end().appendTo('#bgSlideWrap');

        setTimeout(imageSlide, 4000);
    }
    $('#musicSlideWrap img:gt(0)').hide();
    $('.arrow').stop().on('click', function(){
        $('#musicSlideWrap img:first').fadeOut(500).next().show().end().appendTo('#musicSlideWrap');
    });

    $('.fifth > div:nth-child(2)').on('click', function(){
        $('#apps').css({
            'display' : 'none',
            'z-index' : '-9999'
        });
        $('#blockApp').css({
            'display' : 'block',
            'z-index' : '9999'
        });
    });
    $('#blockApp').on('click', function(){
        $('#apps').css({
            'display' : 'block',
            'z-index' : '9999'
        });
        $('#blockApp').css({
            'display' : 'none',
            'z-index' : '-9999'
        });
    });

    $('.fifth > div:nth-child(3)').on('click', function(){
        $('#changeBG').css({
            'display' : 'block',
            'z-index' : '9999'
        });
    });
    $('#changeBG').on('click', function(){
        $('#changeBG').css({
            'display' : 'none',
            'z-index' : '-9999'
        });
    });

    $('#bgWrap > div:nth-child(1)').on('click', function(){
        $('#appsWrap').css('background-image', "url('../image/bg/1.jpg')");
    });
    $('#bgWrap > div:nth-child(2)').on('click', function(){
        $('#appsWrap').css('background-image', "url('../image/bg/2.jpg')");
    }); 
    $('#bgWrap > div:nth-child(3)').on('click', function(){
        $('#appsWrap').css('background-image', "url('../image/bg/3.jpg')");
    });
}
function crtTime(){
    var date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth(),
        today = date.getDate(),
        day = date.getDay(),
        hour = date.getHours(),
        min = date.getMinutes(),
        second = date.getSeconds();
    var monthName = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
        dayName = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];

        hour = hour < 10 ? "0"+hour : hour;
        min = min < 10 ? "0"+min : min;
        second = second < 10 ? "0"+second : second;

        $('.third > div:nth-child(3) span').html(hour+":"+min+":"+second);
        $('.fourth > div:nth-child(2) span').html(year);
        $('.fourth > div:nth-child(4) span').html(monthName[month]);
        $('.fourth > div:nth-child(5) span').html(today+"th");
        $('.fourth > div:nth-child(6) span').html(dayName[day]);
        setTimeout(crtTime, 500);
}
function onWindowResize(){
    width = window.innerWidth;
    height = window.innerHeight;
}
function animate(){

    requestAnimationFrame(animate);
}
