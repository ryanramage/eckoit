var app = app || {};


app.controller = app.controller || {};



app.controller.save = app.controller.save || {};


app.controller.save.topic = function() {
   
}



app.view = {};


app.view.current = "";


app.view.mainPageChange = function(page, data) {

    data = data || {};
    var template = page + 'Template';
    try {
        $('.main').html( ich[template](data)  );
        app.view.current = page;
    } catch (e) {}
}


app.view.activeCategory = function(category) {
    $('.maintabs li').removeClass('active');
    $('.maintabs .' + category).addClass('active');
}



app.onDomReady = function() {

}





app.routes = {
        '/dashboard' : {
            on : function() {
                app.view.activeCategory('dashboard');
                app.view.mainPageChange('dashboard');
            }
        },
        '/timeline' : {
            on : function() {app.view.activeCategory('timeline')}
        },
        '/topics': {
          '/tagged/([^/]+)': {
                on: function(tags) {
                    _tags = app.view.splitTags(tags);
                    app.view.activeCategory('topics');
                    app.view.mainPageChange('topics', {tags:_tags});
                    
                }
          },
          '/new' : {
                "/([^/]+)" : {
                    on : function(newType) {
                        app.view.activeCategory('topics');
                        app.view.mainPageChange('topicNew', {type : newType});
                        // set the radio
                        

                        $('#' + newType + 'Type').attr('checked', true);
                        
                        var template = newType + 'CreateTemplate';
                        try {
                            $('.topicTypeForm').html( ich[template]()  );
                        } catch(e) {}
                        $('form.newForm .save').click(function() {
                            console.log('save: ' + newType);
                            app.controller.save[newType]();
                            return false;
                        });


                    }
                },
                on: function() {
                    app.view.activeCategory('topics');
                    app.view.mainPageChange('topicNew');
                    

                }
          },
          on: function() {
              app.view.activeCategory('topics');
              app.view.mainPageChange('topics');
          }
        },
        '/threads' : {
            on : function() {app.view.activeCategory('threads')}
        },
        '/meetings' : {
            on : function() {app.view.activeCategory('meetings')}
        }
};


app.view.splitTags = function(tags) {
    if (!tags) return [];
    var _tags = tags.split("+");
    if (_tags == "") return [];

    return _tags;
}