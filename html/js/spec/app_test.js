

describe("Main Category Changes", function() {



  it("should switch highlighted tabs", function() {
      loadFixtures('maintabs.html');
      app.controller.on('topics');
      expect($('.topics')).toHaveClass('active');
      app.controller.on('meetings');
      expect($('.topics')).not.toHaveClass('active');
      expect($('.meetings')).toHaveClass('active');

  });



});
