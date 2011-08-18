describe("ThingListView", function() {
  
  beforeEach(function() {
    this.view = new ThingListView();
    
  });
  
  describe("Instantiation", function() {
    
    it("should create a list element", function() {
      expect(this.view.el.nodeName).toEqual("UL");
    });
    
    it("should have a class of 'things'", function() {
      expect($(this.view.el)).toHaveClass('things');
    });

  });
  
  describe("Rendering", function() {

    beforeEach(function() {
      this.thingView = new Backbone.View();
      
      // stub the render method on the ThingView stub
      this.thingView.render = function() {
        this.el = document.createElement('li');
        return this;
      };
      
      this.thingRenderSpy = sinon.spy(this.thingView, "render");  // create a fake ThingView and spy on its render method
      
      this.thingViewStub = sinon.stub(window, "ThingView")
        .returns(this.thingView);
      this.thing1 = new Backbone.Model({id:1});
      this.thing2 = new Backbone.Model({id:2});
      this.thing3 = new Backbone.Model({id:3});
      this.view.collection = new Backbone.Collection([
        this.thing1,
        this.thing2,
        this.thing3
      ]);
      this.view.render();
    });

    afterEach(function() {
      window.ThingView.restore();
    });

    it("should create a Thing view for each thing item", function() {
      expect(this.thingViewStub).toHaveBeenCalledThrice();
      expect(this.thingViewStub).toHaveBeenCalledWith({model:this.thing1});
      expect(this.thingViewStub).toHaveBeenCalledWith({model:this.thing2});
      expect(this.thingViewStub).toHaveBeenCalledWith({model:this.thing3});
    });

    it("should render each Thing view", function() {
      expect(this.thingView.render).toHaveBeenCalledThrice();
    });

    it("appends the thing to the thing list", function() {
      expect($(this.view.el).children().length).toEqual(3);
    });

  });
    
});

