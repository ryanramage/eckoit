$(document).ready(function(){

    jQuery.couch.urlPrefix = 'api';
    app.router = Router(app.routes).init('/dashboard');




    $('.newTopicType input').live('click', function() {
        var rt = "/topics/new/" + $(this).val();
        app.router.setRoute(rt);
    }) ;


    app.onDomReady();

    $("abbr.timeago").timeago();
});