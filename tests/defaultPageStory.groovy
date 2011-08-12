using "geb"

scenario "index page", {

    when "we open the index page", {
        go "http://localhost:5984/grand_design_unstable/_design/app/index.html#Meeting"
    }
    then "The title shown is meeting", {

        $('span#title').text().shouldBe "Meeting"
    }
    and
    then "The tag shown is Default Tags", {
        $('div#taglist a', 0).text().shouldBe "Default Tags"

    }
}




