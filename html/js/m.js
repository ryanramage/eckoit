var app = app || {};


app.controller = app.controller || {};

app.model = {};
app.model.current_tag_group = {};

jQuery.couch.urlPrefix = 'api';

app.controller.init = function(details) {
    if (!details.tag_groups) return;
    app.model.details = details;
    $.each(details.tag_groups, function(i, group) {
        app.controller.addTagGroup(i, group);
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


        $.mobile.messageBox( "Saving...", 800 );
        app.controller.addCurrentPosition(doc, function(doc) {            
            app.controller.saveCouch(doc, function() {
                $.mobile.messageBox( "Save Complete.", 800 );
                $('#note').val('');
            }, function() {
                // cant get to couch...save to local cache
                app.controller.saveLocal(doc, function() {
                    $.mobile.messageBox( "Saved. Will upload on connect.", 800 );
                    $('#note').val('');
                }, function(error) {
                   // something really bad. Cant save anywhere!
                });
            });


        })



        // clear the text input
        
        return false;
    });

    var fix = function() {

        $('.utaggroups').data('role', 'navbar')
        $('.utaggroups').navbar();
        $('.tag-group-tags').trigger('create');
    }
    setTimeout(fix, 2);


}

app.controller.addTagGroup = function(i, group) {

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
            error(e);
        }
}


app.controller.saveLocal = function(doc, success, error) {
    try {
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
        amplify.store('utags', []); 
        app.failed = [];
        $.each(saved, function(i, doc) {
            app.controller.saveCouch(doc, function() {

            }, function() { 

               var changed = amplify.store('utags');
               changed.push(doc);
               amplify.store('utags', changed);
            });
        });
    }
    setTimeout(app.uploadLocalTags, 10000);
}




$('#utag').live('pagecreate',function(event){
    $.couch.db('').openDoc('-settings', {
        success : function(doc) {
            app.controller.init(doc);
        }
    });

});


app.controller.enableGeotag = false;
app.controller.updateLocation = null;
app.controller.currentLocation = 0;

app.controller.addCurrentPosition = function(doc, callback) {

    var lastpos = Geotag.getLastPosition();
    if (lastpos) {
        doc.position = lastpos.coords;
        if (GeoHash) {
             doc.position.geohash = GeoHash.encodeGeoHash(doc.position.latitude, doc.position.longitude);
        }
        
    }

    callback(doc);
    return;
    
}






$(function() {

    

    // handle the tag groups
    $('.tab').live('click', function() {
        $('.tab').removeClass('ui-btn-active');
        $(this).addClass('ui-btn-active');
        return false;
    });


    // hide the footer nav on note.
    // make room for some mobile keyboards
    $('#note').focus(function() {
        $('.main-menu').parent().hide()
    }).blur(function() {
        $('.main-menu').parent().show()
    });

    // start the uploadLocalTags timer
    setTimeout(app.uploadLocalTags, 10000);



    // track position
    if(window.navigator.geolocation) {
        Geotag.init();
    }



});


// on leaving the page, notify the user if tags not uploaded.
function unloadPage(){
   var saved = amplify.store('utags');
   if (saved && saved.length > 0) {
       return "You have " + saved.length + " tags to upload. Leaving will lose them";
   }
   
}
window.onbeforeunload = unloadPage;