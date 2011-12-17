
var importSupport = importSupport || {};


importSupport.makeSlug = function(fullName) {
    return fullName.replace(/\W/g, '.').toLowerCase();
}


importSupport.cleanUpFullName = function(fullName) {

    // Lastname, firstname
    if (fullName.indexOf(',')) {
        var pieces = fullName.split(",", 2);
        fullName = $.trim(pieces[1]) + " " + $.trim(pieces[0]);

    }

    // email addresses
    if (fullName.indexOf('@')) {
        fullName = fullName.split("@", 1)[0];
    }

    // split, capitialize
    var names = fullName.split(/[\W_]/);
    var newNames = [];
    $.each(names, function(i, name) {
       if (!name || name == '') return;
       name = $.trim(name);
       var newName = name[0].toUpperCase() + name.substr(1);
       newNames.push(newName);

    });

    fullName = newNames.join(" ");    
    return fullName;

}



importSupport.parseGoogleContact = function(entry) {
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
      contact.fullName = importSupport.cleanUpFullName(name);
      
      if (contact.fullName) {
          contact.slug = importSupport.makeSlug(contact.fullName);
      }

      $.each( entry.getEmailAddresses(), function( j, address ){
          contact.email = address.address;
      });

      if (entry.link) {
          $.each(entry.link, function(i, link) {
                if (link.type && link['gd$etag'] && link.type == 'image/*') {
                    var feedLink = entry.getLink('http://schemas.google.com/contacts/2008/rel#photo', 'image/*');
                    contact.image = feedLink.getHref();
                }
          });
      }

      return contact;
}