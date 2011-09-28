$(document).ready(function(){


    app.router = Router(app.routes).init('/dashboard');




    $('.newTopicType input').live('click', function() {
        var rt = "/topics/new/" + $(this).val();
        app.router.setRoute(rt);
    }) ;


    app.onDomReady();


});