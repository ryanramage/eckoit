

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



describe("Topics filtered by Tags", function() {
  it("should parse tags seperated by +", function() {
     var result = app.view.splitTags("apple+pear");
     expect(result).toContain("apple");
     expect(result).toContain("pear");
  });
  it("should handle one tag", function() {
      var result = app.view.splitTags("apple");
      expect(result.length).toBe(1);
     expect(result).toContain("apple");
  });
  it ("should be an empty array on no tags", function() {
     var result = app.view.splitTags("");
     expect(result).toBeDefined();
     expect(result.length).toBe(0);

  })
  it ("should be an empty array on null", function() {
     var result = app.view.splitTags(null);
     expect(result).toBeDefined();
     expect(result.length).toBe(0);

  })
});
