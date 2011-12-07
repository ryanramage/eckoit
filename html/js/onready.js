$(document).ready(function(){

    jQuery.couch.urlPrefix = 'api';
    app.router = Router(app.routes).init('/dashboard');




    $('.newTopicType input').live('click', function() {
        var rt = "/topics/new/" + $(this).val();
        app.router.setRoute(rt);
    }) ;


    $('.topicFilter li').live('click', function() {
        var sort = $(this).data('sort');
        
    });



    app.onDomReady();

    $("time.timeago").timeago();
});