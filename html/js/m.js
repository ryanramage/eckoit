var app = app || {};


app.controller = app.controller || {};



eckoit = eckoit || {};

eckoit.utag_panel = function(node, options) {
    this.node = node;
    this.options = options || {}
}
eckoit.utag_panel.prototype = {
    init: function(details) {
        this.details = details;

    },
    render : function() {
        
    }



}


app.slideCount = 5;

app.updateDisks = function () {
    var zeroIndexSlideCount = app.slideCount - 1;
    var pos = window.mySwipe.getPos();
    var after = zeroIndexSlideCount - pos;
    var before  = zeroIndexSlideCount - after;

    var append = function(node, count) {
        for (var i=0; i < count; i++) {
            node.append('<span>&#8226;</span>');
        }
        
    }

    $('.header .before').empty();
    append($('.header .before'), before);

    $('.header .after').empty();
    append($('.header .after'), after);


}





$(function() {

    $('#slider li div').height($(window).height() - 200);


    window.mySwipe = new Swipe(document.getElementById('slider'), {
        callback : function() {
            app.updateDisks();
        }
    });

    app.updateDisks();
    
    $('.add').click(function() {
        $('#slider ul').append("<li><div>ADDED</div></li>");
        window.mySwipe.setup();
        app.slideCount++;
        app.updateDisks();
    })

});