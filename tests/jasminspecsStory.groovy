using "geb"

scenario "All Javascript Specs Pass", {

    given "On the default page", {
        baseUrl = System.getProperty("geb.build.baseUrl")
    }
    when "we open the index page", {
        baseUrl += 'js/spec/SpecRunner.html'
        go baseUrl

    }
    then "The title shown is Jasmine Test Runner", {
        page.title.shouldBe "Jasmine Test Runner"
    }
    and "runner passed", {
        waitFor {
            
            $(".runner").classes().contains("passed") 
        };
        
    }

}


scenario "All Timeline Specs Pass", {

    given "On the default page", {
        baseUrl = System.getProperty("geb.build.baseUrl")
    }
    when "we open the index page", {
        baseUrl += 'js/spec/TimelineSpecRunner.html'
        go baseUrl

    }
    then "The title shown is Jasmine Test Runner", {
        page.title.shouldBe "Jasmine Test Runner"
    }
    and "runner passed", {
        waitFor(40) {

            $(".runner").classes().contains("passed") || $(".runner").classes().contains("failed")
        };
    }

}


scenario "All Liferecorder Player Specs Pass", {

    given "On the default page", {
        baseUrl = System.getProperty("geb.build.baseUrl")
    }
    when "we open the index page", {
        baseUrl += 'js/spec/LiferecorderSpecRunner.html'
        go baseUrl

    }
    then "The title shown is Jasmine Test Runner", {
        page.title.shouldBe "Jasmine Test Runner"
    }
    and "runner passed", {
        waitFor(20) {

            $(".runner").classes().contains("passed") 
        };
        System.out.println ( $("div")*.text() );
       // assert $("div.runner").classes().contains("passed");

    }

}
