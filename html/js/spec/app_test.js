

describe("Main Category Changes", function() {



  it("should switch highlighted tabs", function() {

      loadFixtures('maintabs.html');
      app.view.activeCategory('topics');
      expect($('.topics')).toHaveClass('active');
      app.view.activeCategory('meetings');
      expect($('.topics')).not.toHaveClass('active');
      expect($('.meetings')).toHaveClass('active');

  });



});
