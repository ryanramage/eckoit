using "geb"

scenario "All Javascript Specs Pass", {

    given "On the default page", {
        baseUrl = System.getProperty("geb.build.baseUrl")
    }
    when "we open the index page", {
        go baseUrl + '/js/SpecRunner.html'
    }
    then "The title shown is meeting", {
        page.title.shouldBe "Jasmine Test Runner"
    }
    and "runner passed", {
        assert $(".runner").classes().contains("passed");
    }

}




