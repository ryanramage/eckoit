using "geb"

scenario "All Javascript Specs Pass", {

    given "On the default page", {
        baseUrl = System.getProperty("geb.build.baseUrl")
    }
    when "we open the index page", {
        baseUrl += 'js/SpecRunner.html'
        go baseUrl

    }
    then "The title shown is meeting", {
        page.title.shouldBe "Jasmine Test Runner"
    }
    and "runner passed", {
        waitFor {
            
            $(".runner").classes().contains("passed") || $(".runner").classes().contains("failed")
        };
        System.out.println ( $("div")*.text() );
        assert $("div.runner").classes().contains("passed");
        
    }

}




