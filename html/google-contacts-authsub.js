
    // Load in the gdata library
    // This page must be served over HTTPS to work
    google.load( 'gdata', '1.x' );
    
    // Wait for the document to be ready
    $(function(){
      // Define a controls object with
      // properties for each control in the demo: login, logout and getcontacts.
      // Controls will be iterated over, and <buttons> will be added to the
      // DOM for each control
      var controls = {
        login: {
          label: 'Login to google',
          action: function(){
            // Google authSub login code scoped to the google gdata contacts feeds api
            // When the user is brought to google to grant grant your app permission
            // it will say you are requesting contacts data based on this scope.
            // If the user grants permission to use their data, a two year cookie
            // will be set on the current domain.
            google.accounts.user.login('https://www.google.com/m8/feeds');
          }
        },
        logout: {
          label: 'Logout from google',
          action: function(){
            // log user out from google authSub to your app by deleting the 
            // authSub cookie
            google.accounts.user.logout();          
          }
        },
        getContacts: {
          label: 'Get contacts',
          action: function(){
            // instantiate google gdata contacts api, 
            // and call the gdata list all contacts code
            // Note: user must be logged in for this to work
            
            // Instantiate a new ContactsService which we will use to
            // request the users contacts
            var contactsService = new google.gdata.contacts.ContactsService( 'Contacts Viewer' ),
                // Create a query for the full contacts list
                query = new google.gdata.contacts.ContactQuery( 'https://www.google.com/m8/feeds/contacts/default/full' );

            // Limit the query to the number of results in the numContacts 
            // input (25 by default)
            query.setMaxResults( $('#numContacts').val() );

            // Request the contacts feed with 
            // getContactFeed( query, successCallback, errorCallback )
            contactsService.getContactFeed(
              // query
              query,
              
              // successCallback
              function( result ){
                // Destroy existing contactsHolder if it already exists
                $('#contacts').remove();
                
                // Create <ul> to store our contacts in before we
                // append them to the DOM
                var $contactsHolder = $('<ul>', {
                      id: 'contacts'
                    });
                
                // Iterate over the entries that came back 
                $.each( result.feed.entry, function( i, entry ){
                    console.log(entry);
                  // Call getEmailAddresses() on each entry, and iterate
                  $.each( entry.getEmailAddresses(), function( j, address ){
                    // Append each address to the off DOM <ul> we made
                    $contactsHolder.append( '<li>' + address.address + '</li>' );
                  });                  
                });
                
                // Add the contacts list to the DOM
                $contactsHolder.appendTo( 'body');
              }, 

              // errorCallback
              function( result ){
                // Log the error
                console.log('error: ', result);
              }
            );
          }
        }
      };
      
      // Iterate over the controls and add them to the DOM
      $.each( controls, function( propertyName, control ){
        $( '<button>', {
          html: control.label,
          id: propertyName
        })
        .appendTo( 'nav' );
      });
      
      // Delegate click handlers to all buttons in our <nav> element.
      $( 'nav' ).delegate('button', 'click', function(){
        // Since we gave an id to each button name based on it's property name
        // in the controls object, we can use that use that id to dereference the
        // correct controls property and call it's action method
        controls[ this.id ].action();
      })



      $('#twitter').click(function() {
             var username = $('#numContacts').val();
//             $.ajax({
//                url: 'http://api.twitter.com/1/users/show.json',
//                data: {screen_name: username},
//                dataType: 'jsonp',
//                success: function(data) {
//                    console.log(data);
////                    $('#followers').html(data.followers_count);
//                }
//            });

            $.getJSON('http://twitter.com/statuses/followers.json?screen_name=eckoit&callback=?' , function(data){
                console.log(data);
            })
        });

    });




