describe("ThingView", function() {

  beforeEach(function() {
    this.model = new Backbone.Model({
      id: 1,
      name: "My Thing",
      done: false
    });
    this.view = new ThingView({
      model:this.model,
      template: this.templates.thing
    });
    
    // fixtures, a feature provided by the jasmine-jquery plugin
    setFixtures('<ul class="things"></ul>');
    
  });

  describe("Rendering", function() {
    
    it("returns the view object", function() {
      expect(this.view.render()).toEqual(this.view);
    });
    
    it("produces the correct HTML", function() {
      this.view.render();

      expect( $(this.view.el).find('a:first'))
        .toHaveAttr('href', '#thing/1');

      expect( $(this.view.el).find('a:last'))
        .toHaveAttr('href', '#');
      expect( $(this.view.el).find('a:last'))
        .toHaveClass('edit');

      var html = this.view.el.innerHTML;

      expect($(html).find('h2'))
        .toHaveText('My Thing');

      expect($(html).find('input'))
        .toHaveAttr('value', 'My Thing');
      expect($(html).find('input'))
        .toHaveAttr('type', 'text');
      expect($(html).find('input'))
        .toHaveClass('edit');

    });
    
  });
  
  describe("Template", function() {

    beforeEach(function() {
      $('.things').append(this.view.render().el);
    });

    it("has the correct URL", function() {
      expect($('.things').find('a'))
        .toHaveAttr('href', '#thing/1');
    });

    it("has the correct title text", function() {
      expect($('.things').find('h2'))
        .toHaveText('My Thing');
    });

  });
  
  describe("When thing is done", function() {

    beforeEach(function() {
      this.model.set({done: true}, {silent: true});
      $('.things').append(this.view.render().el);
    });

    it("has a done class", function() {
      expect($('.things a:first-child'))
        .toHaveClass("done");
    });

  });
  
  describe("Edit state", function() {
    
    describe("When edit button handler fired", function() {

      beforeEach(function() {
        this.clock = sinon.useFakeTimers();  // frig around with the clock as we're not waiting for animations to complete
        $('ul.things').append(this.view.render().el);
        this.li = $('ul.things li:first');
        this.li.find('a.edit').trigger('click');
      });

      afterEach(function() {
        this.clock.restore();
      });

      it("shows the edit input field", function() {
        this.clock.tick(600);
        expect(this.li.find('input.edit'))
          .toBeVisible();
        expect(this.li.find('h2'))
          .not.toBeVisible();          
      });
      
    });
    
  });
  
});

