var app = app || {};


app.controller = app.controller || {};

app.controller.current = "";






app.controller.on = function(page, params) {


}



app.view = {};



app.view.mainPageChange = function(page) {
    var template = page + 'Template';
    try {
        $('.main').html( ich[template]()  );
    } catch (e) {}
}


app.view.activeCategory = function(category) {
    $('.maintabs li').removeClass('active');
    $('.maintabs .' + category).addClass('active');
}



app.routes = {
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
          '/new' : {
                on: function() {app.controller.on('topicNew'); }
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


