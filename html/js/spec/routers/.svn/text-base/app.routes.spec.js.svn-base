describe("App Router Routes", function() {

  beforeEach(function() {
    this.routeSpy = sinon.spy();
    this.appRouter = new AppRouter();
  });
  
  afterEach(function() {
  });
  
  it("fires the index route with a blank hash", function() {
    this.appRouter.bind("route:index", this.routeSpy);
    window.location.hash = "";
    Backbone.history.start();
    expect(this.routeSpy).toHaveBeenCalledOnce();
    expect(this.routeSpy).toHaveBeenCalledWith();
    this.appRouter.unbind("route:index");
  });

  it("fires the thing detail route", function() {
    this.appRouter.bind("route:thing", this.routeSpy);
    Backbone.history.navigate("thing/1", true);
    expect(this.routeSpy).toHaveBeenCalledOnce();
    expect(this.routeSpy).toHaveBeenCalledWith("1");
    this.appRouter.unbind("route:thing");
  });

});

