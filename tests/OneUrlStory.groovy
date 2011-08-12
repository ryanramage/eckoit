using "geb"

scenario "no eckoit installed, access app.eckoit.com", {

    given "eckoit is not installed locally"
    and
    given "a db with id abcdefghijk exists on the couchdb hosted app.eckoit.com"
    when "we open http://app.eckoit.com:5984/abcdefghijk/#Meeting"
    then "we will be redirected to http://account.eckoit.com/?db=abcdefghijk&path=Meetingreason=You are not authorized#login"
    and "email and password fields available"
    and "there will be a message You are not authorized"
}

scenario "login to account and redirect", {
    given "at location http://account.eckoit.com/?db=abcdefghijk&path=Meetingreason=You are not authorized#login"
    and "a user named test@test.com that has access to http://app.eckoit.com:5984/abcdefghijk"
    when "the user logs in"
    then "they are redirected to http://app.eckoit.com:5984/abcdefghijk/#Meeting"
    and "it will be a secure connection"
}

scenario "local couchdb, access app.eckoit.com", {
    given "eckoit is installed locally"
    and "a db with id abcdefghijk exists on the local couchdb "
    and "hosts file is set to point app.eckoit.com to localhost"
    when "we open http://app.eckoit.com:5984/abcdefghijk/#Meeting"
    then "the local copy of the app will be opened"
}







