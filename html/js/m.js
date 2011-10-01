var app = app || {};


app.controller = app.controller || {};




app.slideCount = 5;

app.updateDisks = function () {
    var zeroIndexSlideCount = 0;
    var pos = window.mySwipe.getPos();
    var after = zeroIndexSlideCount - pos;
    var before  = zeroIndexSlideCount - after;

    var append = function(node, count) {
        for (var i=0; i < count; i++) {
            node.append('<span>&#8226;</span>');
        }
        
    }


}





$(function() {
    $(window).live('swipeleft', function() {
        console.log('left');
    });


});