
var offline = true;
try {
    // Load in the gdata library
    // This page must be served over HTTPS to work
    google.load('gdata', '2.x', {packages: ['contacts']});
    offline = false;
} catch (e) {}


    
// Wait for the document to be ready
$(function(){

    // global config for the page
    jQuery.couch.urlPrefix = 'api';
    humane.clickToClose = false;
    humane.timeout = 500;


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

        });



        $('.contactImportStages .stage0 .btn').live('click', function() {
            $('.stage0').hide(300);
            $('.stage1').show(300);


            if (!offline) loginContacts();


            // a place to store results
            var peopleSlugs = {};
            var googleContacts;
            

            // some awesome aysnc
            async.auto({
                get_imported_allready : function(callback) {
                    app.controller.peopleByImport('google', {}, function(results) {
                        googleContacts = importSupport.convertToPreexistingContactMap(results);
                        callback();
                    });
                },
                get_people_slugs : function(callback) {
                    app.controller.peopleSlugCount(function(results) {
                         $.each(results.rows, function(i, row) {
                                peopleSlugs[row.key] = row.value;
                         });
                         callback();
                    });
                },
                call_google : ['get_imported_allready', function(callback) {

                        var batch = function(contacts){
                                // a batch is complete
                                // filter any that we already have

                                if (!contacts || contacts.length == 0) return;
                                async.filter(contacts,
                                    function(contact, okToImportCallback){
                                        //okToImportCallback(!importSupport.isPreexisting(contact, googleContacts))
                                        okToImportCallback(true);
                                    },
                                    function(filteredContacts) {
                                        showContacts(filteredContacts);
                                    }
                                );

                        };
                        var allDone = function() {
                                // all importing is complete
                                $('.contactImportStages .stage1').hide();
                                $('.zebra-striped').tablesorter( {textExtraction: contactSortTextExtract} );
                                $('.btn').twipsy();
                                callback();
                        };


                        if (offline) {
                            mockImportContacts(googleContacts, batch, allDone);
                        } else {
                            importContacts(googleContacts, batch, allDone );
                        }




                        
                }],
                higlight_duplicate_slugs : ['call_google', 'get_people_slugs', function(callback) {
                    
                }]
            });
        });


        $('input.fullName').live('change', function() {
            var slug = importSupport.makeSlug($(this).val());
           $(this).parent().parent().find('input.slug').val(slug);
        });

        // add dirty
        $('input').live('change', function() {
            $(this).parent().parent().children('td').addClass('dirty');
        });


        $('a.remove').live('click', function() {
            var me = $(this);
            var contactID = me.parent().parent().data("id");

            app.controller.tombstonePerson(contactID, function() {
                me.parent().parent().hide(500);
            });

            //var cb = $(this).parent().parent().hide(500);
        })


        $('.actions button.finish').live('click', function() {


            var toUpdate = [];

            $('.dirty').parent().each(function() {
               var me = $(this);
               var update = {
                   id : $(this).data("id"),
                   fullName : me.find('input.fullName').val(),
                   firstName : me.find('input.firstName').val(),
                   slug : me.find('input.slug').val()
               };
               toUpdate.push(update);               
            });


            async.forEach(toUpdate,
                function(item, callback){
                   app.controller.getPerson(item.id, function(doc) {
                        doc.fullName = item.fullName;
                        doc.firstName = item.firstName;
                        doc.slug = item.slug;
                        app.controller.savePerson(doc, function() {
                            callback();
                        });
                   });

                }, function() {
                    window.location = '.#/people';
                }
            );
               





            



        });

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



      function findExistingPeople() {
          app.controller.peopleByImport('google', {}, function(results) {

          });
      }


      function mockImportContacts(googleContacts, batchComplete, allComplete) {
          // simply load all the contacts we have
          app.controller.findPeople(function(results){
              var contacts = [];
              $.each(results.rows, function(i,row){
                  var contact = row.doc;
                  contacts.push(contact);
              });
              batchComplete(contacts);
              allComplete();
          }, true);
      }



      function importContacts(googleContacts, batchComplete, allComplete) {
            var contactsService = new google.gdata.contacts.ContactsService( 'Contacts Viewer' ),
            query = new google.gdata.contacts.ContactQuery( 'https://www.google.com/m8/feeds/contacts/default/full' );


            var parseResults = function( result ){
                var contacts = [];
                // Iterate over the entries that came back

                async.forEach(result.feed.entry,
                    function(entry, callback) {
                            var contact = importSupport.parseGoogleContact(entry);
                            if(!importSupport.isPreexisting(contact, googleContacts)) {
                                app.savePerson(contact, function() {
                                    contacts.push(contact);
                                    callback();
                                }, function(err){
                                    callback();
                                });
                            } else callback();
                           
                    }, function(err) {
                        batchComplete(contacts);
                        var nextFeed =  result.feed.getNextLink();
                        if (nextFeed) {
                            setTimeout(function() {
                                var nextQuery = new google.gdata.contacts.ContactQuery( nextFeed.getHref());
                                contactsService.getContactFeed(nextQuery, parseResults);
                            }, 100);
                        } else {
                            allComplete();
                        }
                    }
                );
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




