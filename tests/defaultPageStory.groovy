using "geb"

scenario "index page", {

    given "On the default page", {
        baseUrl = System.getProperty("geb.build.baseUrl")
    }
    when "we open the index page", {
        go baseUrl
    }
    then "The title shown is meeting", {
        page.title.shouldBe "Ecko-It"
    }

}




