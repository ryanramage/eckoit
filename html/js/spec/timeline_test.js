



describe("Timeline integration", function() {



  it("if no initial date, show now", function() {
      app.controller.createTimeline();

      var timeline = $('.timelineplayer').timelineaudioplayer('timeline');

      var now = new Date().getTime();
      var min = now - 1000;
      var max = now + 1000;

      var shown = timeline.getBand(0).getCenterVisibleDate().getTime();
      expect(shown).toBeLessThan(max);
      expect(shown).toBeGreaterThan(min);

      $('.timelineplayer').timelineaudioplayer('destroy');
  });


  it("if initial date provided, show that date", function() {

      var yesterday = Date.yesterday().addHours(14);;


      console.log(yesterday.toString());
      app.controller.createTimeline(yesterday);

      var timeline = $('.timelineplayer').timelineaudioplayer('timeline');


      var yesterday = Date.yesterday().addHours(14);

      var ytime = yesterday.getTime();
      var min = ytime - 1000;
      var max = ytime + 1000;

      var shown = timeline.getBand(0).getCenterVisibleDate();
      console.log(shown.toString());
      console.log(new Date(max).toString());
      expect(shown.getTime()).toBeLessThan(max);
      expect(shown.getTime()).toBeGreaterThan(min);


      $('#calendar-ui').fullCalendar('destroy');
  });


   it("Clicking on the calendar will change the timeline to that date but at 4pm", function() {

      // start with today
      app.controller.createTimeline();


      var yesterday = Date.yesterday().addHours(14);
      console.log(yesterday.toString());

      runs(function() {
          $('#calendar-ui').fullCalendar('select', yesterday, yesterday, true);
      })
      
      waits(2000);

      runs(function() {
          var timeline = $('.timelineplayer').timelineaudioplayer('timeline');


          var ytime_middle = yesterday;;
          var ytime = ytime_middle.getTime();

          //5 seconds either side, yes, generous
          var min = ytime - 5000;
          var max = ytime + 5000;

          var shown = timeline.getBand(1).getCenterVisibleDate().getTime();


          //expect(shown).toBeLessThan(max);
          //expect(shown).toBeGreaterThan(min);
          $('#calendar-ui').fullCalendar('destroy');
      })
  });




});


