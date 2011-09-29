var app = app || {};


app.controller = app.controller || {};



$(function() {

    $('#slider li div').height($(window).height() - 200);


    window.mySwipe = new Swipe(document.getElementById('slider'));

    $('.add').click(function() {
        $('#slider ul').append("<li><div>ADDED</div></li>");
        window.mySwipe.setup();
    })

});