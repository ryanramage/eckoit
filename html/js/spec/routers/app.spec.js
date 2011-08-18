describe("AppRouter", function() {

  beforeEach(function() {
    this.controller = new AppRouter();
    this.collection = new Backbone.Collection();
    this.fetchStub = sinon.stub(this.collection, "fetch")
      .returns(null);
    this.thingListViewStub = sinon.stub(window, "ThingListView")
      .returns(new Backbone.View());
    this.thingsCollectionStub = sinon.stub(window, "Things")
      .returns(this.collection);
  });
  
  afterEach(function() {
    window.ThingListView.restore();
    window.Things.restore();
  });

  describe("Index handler", function() {
  
    describe("when no Thing list exists", function() {
  
      beforeEach(function() {
          this.controller.index();
        });
    
      it("creates a Thing list collection", function() {
        expect(this.thingsCollectionStub)
          .toHaveBeenCalledOnce();
        expect(this.thingsCollectionStub)  
          .toHaveBeenCalledWithExactly();
      });
  
      it("creates a Thing list view", function() {
        expect(this.thingListViewStub)
          .toHaveBeenCalledOnce();
        expect(this.thingListViewStub)
          .toHaveBeenCalledWith({
            collection: this.collection
          });
      });
  
      it("fetches the Thing list from the server", function() {
        expect(this.fetchStub).toHaveBeenCalledOnce();
        expect(this.fetchStub).toHaveBeenCalledWith();
      });
  
    });
  
  });

});

