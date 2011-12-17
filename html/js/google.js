
var offline = true;
try {
    // Load in the gdata library
    // This page must be served over HTTPS to work
    google.load('gdata', '2.x', {packages: ['contacts']});
    offline = false;
} catch (e) {}


    
// Wait for the document to be ready
$(function(){

        $('.action a.cancel').live('click', function() {
            history.go(-1);
            return false;
        });


        if (offline) {
            $('.offline').show();
            //$('.action a.primary').hide();
            //return;
        }



        $('.action a.calendar').live('click', function() {
            $('.action').hide(300);
            $('.calendarImportStages').show(300);
            loginCalendar();
            importContacts();
        });

        var contactSortTextExtract = function(node) {
            return $(node).find('input').val();
        }


        $('.action a.contacts').live('click', function() {
            $('.action').hide(300);
            $('.contactImportStages').show(300);
            loginContacts();
            importContacts(showContacts, function() {
                $('.contactImportStages .stage1').hide();
                //$('.editable').toggleEdit();
                $('.zebra-striped').tablesorter( {textExtraction: contactSortTextExtract} );
                $('.btn').twipsy();

            });
        });


        $('input.fullName').live('change', function() {
            var slug = importSupport.makeSlug($(this).val());
           $(this).parent().parent().find('input.slug').val(slug);
        });




        $('a.remove').live('click', function() {
            var cb = $(this).parent().parent().hide(500);
        })



      function showContacts(contacts) {
        $('.contactImportStages .stage2').show();
        $('tbody.precontacts').append( ich['personRow']({people : contacts})  );
      }




      function loginContacts() {
          return google.accounts.user.login('https://www.google.com/m8/feeds');
      }

      function loginCalendar() {
          return google.accounts.user.login('https://www.google.com/calendar/feeds/');
      }






      function importContacts(callback, completeCallback) {
            var contactsService = new google.gdata.contacts.ContactsService( 'Contacts Viewer' ),
            query = new google.gdata.contacts.ContactQuery( 'https://www.google.com/m8/feeds/contacts/default/full' );


            var parseResults = function( result ){
                var contacts = [];
                // Iterate over the entries that came back
                $.each( result.feed.entry, function( i, entry ){
                      var contact = importSupport.parseGoogleContact(entry);
                      contacts.push(contact);
                });

                callback(contacts);

                

                var nextFeed =  result.feed.getNextLink();
                if (nextFeed) {
                    setTimeout(function() {
                        var nextQuery = new google.gdata.contacts.ContactQuery( nextFeed.getHref());
                        contactsService.getContactFeed(nextQuery, parseResults);
                    }, 100);
                } else {
                    completeCallback();
                }
            };

            // start the ball rolling
            contactsService.getContactFeed(query, parseResults);
        }



        function importCalendar() {
            var calendarService = new google.gdata.calendar.CalendarService('Calendar Import');
            var feed = 'https://www.google.com/calendar/feeds/default/private/full';
            var callback = function(result) {
                var entries = result.feed.entry;
                $.each(entries, function(i, entry) {
                    var title = entry.getTitle().getText();
                })

            }

            calendarService.getEventsFeed(feed, callback, function(error){

            });

        }



});




