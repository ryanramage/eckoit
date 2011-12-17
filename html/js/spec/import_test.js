


describe("Make Person Slug", function() {

  it("replace whitepace chars with periods, and lowecase", function() {
        var fullName = 'Optimus Prime';
        var result = importSupport.makeSlug(fullName);
        expect(result).toBe('optimus.prime');
  });

  it("replace multiple whitepace chars with periods, and lowecase", function() {
        var fullName = 'Optimus Max-Bob Prime';
        var result = importSupport.makeSlug(fullName);
        expect(result).toBe('optimus.max.bob.prime');
  });


});



describe("Clean Full Name Strings", function() {

  it("Reverses order of LastName, FirstName strings", function() {
        expect(importSupport.cleanUpFullName('Prime, Optimus')).toBe('Optimus Prime');
  });


  it("Reverses order of LastName, FirstName MiddleName strings", function() {
        expect(importSupport.cleanUpFullName('Prime, Optimus Max')).toBe('Optimus Max Prime');
  });


  it("Pulls From Email Addresses", function() {
        expect(importSupport.cleanUpFullName('optimus.prime@world.com')).toBe('Optimus Prime');
        expect(importSupport.cleanUpFullName('optimus_prime@world.com')).toBe('Optimus Prime');
  });


  it("Capitalizes Names", function() {
        var fullName = 'optimus prime';
        var result = importSupport.cleanUpFullName(fullName);
        expect(result).toBe('Optimus Prime');
  });

});