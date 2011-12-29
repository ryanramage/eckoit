What is Ecko-It?
================

Eckoit is your personal audio wiki. Use it with a liferecorder to keep what you hear. It makes it simple to have an amazing memory.

These are developer instuctions. If you would just like to install Ecko-It, please see:
http://eckoit.com


Development Prerequisites
-------------

 *  Please have couchdb >= 1.1.x installed locally.
 *  Please have java >= 1.6 installed on your computer.
 *  Download the latest reupholster jar file from here: http://code.google.com/p/reupholster/downloads/list


Build and Deploy Local
----------------------

Start reupholster like this: 

    java -jar reupholster-x.x-jar-with-dependencies.jar /Users/ryan/devel/eckoit

The argument is the root of the checked out directory.
It will take a few seconds to upload, but when complete, your browser will launch to the ecko-it webpage.



Build Server
----------------------
CloudBees graciously offers free Jenkins builds to open source projects. The Eckoit build server is here:

https://eckoit.ci.cloudbees.com/


