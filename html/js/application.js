$(document).ready(function(){


    var page_controller = {
        current : "",
        on : function(page, params) {
            $('.maintabs li').removeClass('active');
            $('.maintabs .' + page).addClass('active');
            var template = page + 'Template';
            try {
                $('.main').html( ich[template]()  );
            } catch (e) {}
        }
    }


    var routes = {
        '/dashboard' : {
            on : function() {
                page_controller.on('dashboard')
            }
        },
        '/timeline' : {
            on : function() {page_controller.on('timeline')}
        },
        '/topics': {
          '/tagged/([^/]+)': {
            on: function(tags) {page_controller.on('topics', {tags: tags})}
          },
          on: function() {page_controller.on('topics')}
        },
        '/threads' : {
            on : function() {page_controller.on('threads')}
        },
        '/meetings' : {
            on : function() {page_controller.on('meetings')}
        }
    };
    var router = Router(routes).init('/dashboard');





});