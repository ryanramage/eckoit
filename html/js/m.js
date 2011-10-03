var app = app || {};


app.controller = app.controller || {};

app.model = {};
app.model.current_tag_group = {};

app.controller.init = function(details) {
    if (!details.tag_groups) return;
    app.model.details = details;
    $.each(details.tag_groups, function(i, group) {
        app.controller.addTagGroup(group);
    });

    app.controller.showTagGroup(details.tag_groups[0]);
    $('#addTag').click(function() {

        var doc = {
            type: 'com.eckoit.utag',
            timestamp: new Date().getTime()
        };
        var note = $('#note').val();
        if (note && note.length > 0) {
            doc.note = note;
        }
        doc.transcribe = $('#transcribe').val();
        doc.tags = [];

        // get the tagged
        $('input:checkbox:checked').each(function() {
            var tag = $(this).attr('id');
            doc.tags.push(tag);
        });

        // add any tags from the tag_group
        if (app.current_tag_group && app.current_tag_group.always_tag && app.current_tag_group.always_tag.length > 0) {
            doc.tags =    app.current_tag_group.always_tag.concat(doc.tags);
        }
        app.controller.saveCouch(doc, function() {
            $.mobile.messageBox( "Saved.", 2000 );
        }, function() {
            console.log('prob saving to couch');
            // cant get to couch...save to local cache
            app.controller.saveLocal(doc, function() {
                console.log('save local complete');
                $.mobile.messageBox( "Saved. To be uploaded.", 2000 );
            }, function(error) {
               // something really bad. Cant save anywhere!
               console.log('save local error: ' + error);
            });
        });
        // send to couch
        return false;
    });
}

app.controller.addTagGroup = function(group) {
    var content = $('<li><a href="#"  class="tab  '+group.name+'" >'+ group.name+ '</a></li>');
    $('.tag-groups').append(content);
    content.find('a').click(function() {
        app.controller.showTagGroup(group);
        $('.tag-group-tags').trigger('create');
        $(window).trigger('resize');
    });
}


app.controller.showTagGroup = function(group) {
    $('.tag-group-tags').empty();
    app.current_tag_group = group;
    $.each(group.tags, function(i, tag) {

        var name = tag.name;
        $('.tag-group-tags').append('<input type="checkbox" name="'+name+'" id="'+name+'" class="tag-type" /><label for="'+name+'">'+ name +'</label>');


    });
    $('.' + group.name).addClass('ui-btn-active');
}

app.controller.saveCouch = function(doc, success, error) {
        try {
            $.couch.db('').saveDoc(doc, {
                success: success,
                error: error
            });
        } catch (e) {
            console.log('caught couch offline');
            error(e);
        }
}


app.controller.saveLocal = function(doc, success, error) {
    try {
        console.log('save local');
        // we asssume the that amplify has been loaded in the page
        var saved = amplify.store('utags');
        if (!saved) saved = [];
        saved.push(doc);
        amplify.store('utags', saved);
        success();
    } catch (e) {
        error(e);
    }
}



app.uploadLocalTags = function() {
    var saved = amplify.store('utags');    
    if (saved && saved.length > 0) {
        console.log(saved.length + " saved");
        amplify.store('utags', []); 
        app.failed = [];
        $.each(saved, function(i, doc) {
            app.controller.saveCouch(doc, function() {
                console.log("finally, saved");
            }, function() { 

               var changed = amplify.store('utags');
               changed.push(doc);
               console.log('storing: ' + changed.length);
               amplify.store('utags', changed);
            });
        });
    }
    setTimeout(app.uploadLocalTags, 10000);
}




$('#utag').live('pagecreate',function(event){
      var details = {
        tag_groups: [
            {
                name: "Home",
                tags : [
                    {
                        name: "Funny"
                    },
                    {
                        name : "Helarity"
                    }
                ]
            },
            {
                name : "Work",
                always_tag: ['work'],
                tags : [
                    {
                        name : "Todo"
                    },
                    {
                        name : "Delegate"
                    },
                    {
                        name : "Earthy"
                    }
                ]
            },
            {
                name : "Phone",
                always_tag: [],
                tags : [
                    {
                        name : "mamba"
                    },
                    {
                        name : "baba"
                    },
                    {
                        name : "nobo"
                    }
                ]
            },
        ]
    };
    app.controller.init(details);
});


$(function() {

    jQuery.couch.urlPrefix = 'api';

    $('.tab').live('click', function() {
        $('.tab').removeClass('ui-btn-active');
        $(this).addClass('ui-btn-active');
        return false;
    });



    $('#note').focus(function() {
        $('.main-menu').parent().hide()
    }).blur(function() {
        $('.main-menu').parent().show()
    });


    setTimeout(app.uploadLocalTags, 10000);
});

function unloadPage(){
   var saved = amplify.store('utags');
   if (saved && saved.length > 0) {
       return "You have " + saved.length + " tags to upload. Leaving will lose them";
   }
   
}

window.onbeforeunload = unloadPage;