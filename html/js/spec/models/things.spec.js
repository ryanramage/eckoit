describe("when instantiated with model literal", function() {
  
  beforeEach(function() {
    
    // mock out Thing model so that we're only testing Things collection
    this.thingStub = sinon.stub(window, "Thing");
    this.model = new Backbone.Model({
      id: 5, 
      name: "Foo"
    });
    this.thingStub.returns(this.model);
    this.things = new Things();
    this.things.add({
      id: 5, 
      name: "Foo"
    });
    
    // provide some fixtures for testing Things functionality
    this.thing1 = new Backbone.Model({
      id: 1,
      name: 'Cat'
    });
    this.thing2 = new Backbone.Model({
      id: 2,
      name: 'Badger'
    });
    this.thing3 = new Backbone.Model({
      id: 3,
      name: 'Aardvark'
    });
    
  });
    
  afterEach(function() {
    this.thingStub.restore();
  });

  it("should add a model", function() {
    expect(this.things.length).toEqual(1);
  });
    
  it("should find a model by id", function() {
    expect(this.things.get(5).get("id")).toEqual(5);
  });
  
  it("should order models by name", function() {
    this.things.add([this.thing1, this.thing2, this.thing3]);
    expect(this.things.at(0)).toBe(this.thing3);
    expect(this.things.at(1)).toBe(this.thing2);
    expect(this.things.at(2)).toBe(this.thing1);
  });

});

