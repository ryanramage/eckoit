
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
            var slug = makeSlug($(this).val());

           $(this).parent().parent().find('input.slug').val(slug);
        });




        $('a.remove').live('click', function() {
            console.log('click');
            var cb = $(this).parent().parent().hide(200);

        })



      function showContacts(contacts) {
        $('.contactImportStages .stage2').show();
        $('tbody.precontacts').append( ich['personRow']({people : contacts})  );
      }


      function makeSlug(fullName) {
          return fullName.replace(' ', '.').toLowerCase();
      }


      function loginContacts() {
          return google.accounts.user.login('https://www.google.com/m8/feeds');
      }

      function loginCalendar() {
          return google.accounts.user.login('https://www.google.com/calendar/feeds/');
      }






      function importContacts(callback, completeCallback) {
            // instantiate google gdata contacts api,
            // and call the gdata list all contacts code
            // Note: user must be logged in for this to work

            // Instantiate a new ContactsService which we will use to
            // request the users contacts
            var contactsService = new google.gdata.contacts.ContactsService( 'Contacts Viewer' ),

            // Create a query for the full contacts list
            query = new google.gdata.contacts.ContactQuery( 'https://www.google.com/m8/feeds/contacts/default/full' );


            var parseImage = function(result) {
                console.log(result);
            }


            var parseResults = function( result ){

                var contacts = [];

                // Iterate over the entries that came back
                $.each( result.feed.entry, function( i, entry ){

                      var contact = {};
                      contact.google_id = entry.getId().$t;


                      var parts = contact.google_id.split('/');
                      contact.relativeId = parts[parts.length -1 ];


                      var name = 0;

                      if (entry.gd$name && entry.gd$name.gd$givenName && entry.gd$name.gd$givenName.$t) {
                          contact.firstName = entry.gd$name.gd$givenName.$t;
                      }

                      if (entry.gd$name && entry.gd$name.gd$fullName && entry.gd$name.gd$fullName.$t) {
                          name = entry.gd$name.gd$fullName.$t;
                      } else if (entry.getTitle() && entry.getTitle().getText()) {
                        name = entry.getTitle().getText();
                      } else if (entry.getEmailAddresses()) {
                        name = entry.getEmailAddresses()[0].getAddress();
                      } else {
                        // This should never actually be reached, since users are currently
                        // required to have either a name or an email address
                        name = 'Untitled Contact';
                      }
                      contact.fullName = name;
                      if (contact.fullName) {
                          contact.slug = makeSlug(contact.fullName);
                      }



                      // Call getEmailAddresses() on each entry, and iterate
                      $.each( entry.getEmailAddresses(), function( j, address ){
                          contact.email = address.address;
                        // Append each address to the off DOM <ul> we made
                        //$contactsHolder.append( '<li>' + address.address + '</li>' );
                      });

                      if (entry.link) {
                          $.each(entry.link, function(i, link) {
                                if (link.type && link['gd$etag'] && link.type == 'image/*') {
                                    var feedLink = entry.getLink('http://schemas.google.com/contacts/2008/rel#photo', 'image/*');
                                    contact.image = feedLink.getHref();
                                }
                          });
                      }
                      contacts.push(contact);
                });
                callback(contacts);

                var nextFeed =  result.feed.getNextLink();
                if (nextFeed) {

                    var nextFunction = function() {
                        var nextQuery = new google.gdata.contacts.ContactQuery( nextFeed.getHref());
                        contactsService.getContactFeed(nextQuery, parseResults);
                    }
                    setTimeout(nextFunction, 100);
                    //completeCallback();

                } else {
                    completeCallback();
                }


            };


            // Request the contacts feed with
            // getContactFeed( query, successCallback, errorCallback )
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




