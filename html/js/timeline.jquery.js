(function($) {
$.fn.swipe = function(options) {
    // Default thresholds & swipe functions
    var defaults = {
        threshold: {
            x: 30,
            y: 10
        },
        swipeLeft: function() {alert('swiped left')},
        swipeRight: function() {alert('swiped right')},
        preventDefaultEvents: true
    };

    var options = $.extend(defaults, options);

    if (!this) return false;

    return this.each(function() {

        var me = $(this)

        // Private variables for each element
        var originalCoord = {x: 0, y: 0}
        var finalCoord = {x: 0, y: 0}

        // Screen touched, store the original coordinate
        function touchStart(event) {
            originalCoord.x = event.targetTouches[0].pageX
            originalCoord.y = event.targetTouches[0].pageY
        }

        // Store coordinates as finger is swiping
        function touchMove(event) {
            if (defaults.preventDefaultEvents)
                event.preventDefault();
            finalCoord.x = event.targetTouches[0].pageX // Updated X,Y coordinates
            finalCoord.y = event.targetTouches[0].pageY
        }

        // Done Swiping
        // Swipe should only be on X axis, ignore if swipe on Y axis
        // Calculate if the swipe was left or right
        function touchEnd(event) {
            var changeY = originalCoord.y - finalCoord.y
            if(changeY < defaults.threshold.y && changeY > (defaults.threshold.y*-1)) {
                changeX = originalCoord.x - finalCoord.x

                if(changeX > defaults.threshold.x) {
                    defaults.swipeLeft()
                }
                if(changeX < (defaults.threshold.x*-1)) {
                    defaults.swipeRight()
                }
            }
        }

        // Swipe was canceled
        function touchCancel(event) {
            console.log('Canceling swipe gesture...')
        }

        // Add gestures to all swipable areas
        this.addEventListener("touchstart", touchStart, false);
        this.addEventListener("touchmove", touchMove, false);
        this.addEventListener("touchend", touchEnd, false);
        this.addEventListener("touchcancel", touchCancel, false);

    });
};
})(jQuery);


(function( $ ) {

    var MINUTE = 60;
    var HOUR   = MINUTE * 60;
    var DAY     = HOUR * 24;



    var now = new Date();
    var start = new Date().addYears(-1);

    var settings = {
        start_date : start,
        end_date   : now,
        secs_per_px : 2
    };

    var $div;
    var $calendar;
    var $timeline;
    var paper;


    $.fn.timeline = function(options) {
        if (options) {
            $.extend(settings, options);
        }


        var seconds = settings.start_date.getSecondsBetween(settings.end_date);
        var width = seconds/settings.secs_per_px;   //
        var dayWidth = DAY / settings.secs_per_px;
        var tenMinWidth = MINUTE * 10 / settings.secs_per_px;
        var minuteWidth = MINUTE / settings.secs_per_px;


        // assert we have raphael
        if (!window.Raphael) throw "Raphael is needed for the timeline plugin";
        $div = this;


        $calendar = $('<div class="dateRange1"></div>');
        $calendar.appendTo($div);
        $calendar.continuousCalendar({"weeksBefore":"52","firstDate" : "1/1/2011",  "lastDate":"12/31/2011"});

 
        


        $timeline = $('<div class="calendar"></div>').appendTo($div);
        $timeline.css('overflow-x', 'scroll');


        var $log = $('<div class="log"></div>').appendTo($div);
        


        paper = Raphael($timeline.get(0), width, 200);

        var mainline = paper.path("M0, 100L30000,100");
        mainline.attr("fill", "#ccc");
        mainline.glow();

        var left   =   paper.path("M0 0,L0 200");
        var middle = paper.path("M15000 0,L15000 200");
        var right  =    paper.path("M30000 0,L30000 200");

        var days = settings.start_date.getDaysBetween(settings.end_date);
        //console.log(days);
        for (var i=0; i < days; i++) {
            var offsetx = i * dayWidth;
            var path = "M" + offsetx +  " 0,L"+ offsetx +", 200";
            //console.log(path);
            paper.path(path);


        }


        for (var i=0; i < (6 * 12); i++) {
            var offsetx = i * tenMinWidth;
            var path = "M" + offsetx +  " 90,L"+ offsetx +", 110";
            //console.log(path);
            paper.path(path);
        }

        for (var i=0; i < (60 * 12); i++) {
            var offsetx = i * minuteWidth;
            var path = "M" + offsetx +  " 95,L"+ offsetx +", 105";
            //console.log(path);
            paper.path(path);
        }



        var left2   =   paper.path("M400 0,L400 200");


        var x;
        var down = false;
        var sl;


        var onmousedown = function(event) {
            if(!down) {
                down =true
                x = event.clientX;
                sl= this.scrollLeft;
            }
        }

        var touchstart = function(event) {
            $log.prepend('touch start</br>');
            if (!down) {
                down =true
                try {
                    x = event.touches[0].clientX;
                    sl= this.scrollLeft;
                } catch (e) {}
            }
        }

        var onmousemove = function(event) {
            if (down){
                var scroll = sl + x - event.clientX;
                this.scrollLeft = scroll;
            }
        }
        var touchmove = function(event) {
            if (down) {
                event.preventDefault();
                var scroll = sl + x - event.targetTouches[0].clientX;
                this.scrollLeft = scroll;
            }
        }
        var onmouseup = function(event) {
            down = false;
        }
        
        var touchend = function(event) {
            down = false;
        }


        try {
            document.createEvent('TouchEvent');
            // on touch device
            var $t = $timeline.get(0);
            $t.addEventListener("touchstart", touchstart, false);
            $t.addEventListener("touchmove", touchmove, false);
            $t.addEventListener("touchend", touchend, false);

        }
        catch(e) {
            // non touch device
            $timeline
            .mousedown(onmousedown)
            .mouseup(onmouseup)
            .mousemove(onmousemove)
        }


        $timeline.css({

            'overflow' : 'hidden',
            'cursor' : 'hand'
        });





    }



}(jQuery));



