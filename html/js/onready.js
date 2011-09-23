$(document).ready(function(){



    $('#topbar').dropdown();

    var routes = {
        '/dashboard' : {
            on : function() {
                app.controller.on('dashboard')
            }
        },
        '/timeline' : {
            on : function() {app.controller.on('timeline')}
        },
        '/topics': {
          '/tagged/([^/]+)': {
            on: function(tags) {app.controller.on('topics', {tags: tags}); }
          },
          on: function() {app.controller.on('topics'); }
        },
        '/threads' : {
            on : function() {app.controller.on('threads')}
        },
        '/meetings' : {
            on : function() {app.controller.on('meetings')}
        }
    };
    var router = Router(routes).init('/dashboard');





});