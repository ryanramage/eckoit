$(document).ready(function(){


    // some global settings
    jQuery.couch.urlPrefix = 'api';
    $.jPlayer.timeFormat.showHour = true;

    
    app.router = Router(app.routes).init('/dashboard');






    $('.topicFilter li').live('click', function() {
        var sort = $(this).data('sort');
        
    });





    /******** New Topic Stuff...modularize....***/
    $('.newTopicType input').live('click', function() {
        var rt = "/topics/new/" + $(this).val();
        app.router.setRoute(rt);
    }) ;

    $('.topicTypeForm input.url').live('change', function() {

        var url = $(this).val();
        if (!url) return;
        var snapshot = app.createBitPixelUrl(url);
        $('.topicTypeForm img.thumbnail')
            .attr('src', snapshot);
    });







    // ******************* New Person Stuff. Should be modularized **********//
    $('.peoplesource button.add').live('click', function() {
        $(this).attr('disabled', 'disabled');
        $('form.newPerson').show();
        $('form .newPersonPart2').hide();

    });

    $('form.newPerson  a.cancel').live('click', function() {
        $('form.newPerson').hide(300);
        $('.peoplesource button.add').removeAttr('disabled');
        $('form.newPerson  button.save').text('Next');
        return false;

    });

    $('.newPerson input[name="photo-url"]').live('change', function() {
        var imgUrl = $(this).val();
        if(!imgUrl) imgUrl = 'http://placehold.it/90x90';
        $('.newPerson span.photourl img').attr('src', imgUrl);
    });


    $('form.newPerson  button.save').live('click', function() {

            if ($(this).text() == 'Next') {
                try {

                    var cleanName = importSupport.cleanUpFullName($('.newPerson input[name="DisplayName"]').val());

                    
                    var nameSplit = app.parseName($('.newPerson input[name="DisplayName"]').val())
                    var nameTag   = importSupport.makeSlug(cleanName);

                    $('.newPerson input[name="nametag"]').val(nameTag);
                    $('.newPerson input[name="firstName"]').val(nameSplit.first);
                } catch(e) {console.log(e)}
                $(this).text('Save');
                $('form .newPersonPart2').show(300);
            } else {
                try {
                     var person = {
                        fullName :  $('.newPerson input[name="DisplayName"]').val(),
                        email :     $('.newPerson input[name="email"]').val(),
                        slug :      $('.newPerson input[name="nametag"]').val(),
                        firstName : $('.newPerson input[name="firstName"]').val(),
                        tags :      $('.newPerson input[name="tags"]').val(),
                        picture:    $('.newPerson input[name="photo-url"]').val()
                    }
                    app.savePerson(person, function() {
                        $('form.newPerson').hide(300);
                        $('.peoplesource button.add').removeAttr('disabled');
                        $('form.newPerson  button.save').text('Next');
                        app.controller.findPeople(function(results){
                           app.view.showPeople(results);
                        });
                    });
                } catch (e) {console.log(e)}
                return false;

            }


        return false;
    });
    // ********************** End New Person Stuff *************************/


    app.onDomReady();

    $("time.timeago").timeago();
});