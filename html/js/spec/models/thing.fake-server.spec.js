describe("Thing model", function() {
  
  beforeEach(function() {
    this.fixture = this.fixtures.Things.valid;  // our fixtures file
    this.server = sinon.fakeServer.create();
    
    this.server.respondWith(
      "GET",
      "/things",
      this.validResponse(this.fixture)          // defined in spec-helpers.js
    );

    this.things = new Things();
  });
    
  afterEach(function() {
    this.server.restore();
  });

  it("should make the correct request", function() {
    this.things.fetch();
    expect(this.server.requests.length)
      .toEqual(1);
    expect(this.server.requests[0].method)
      .toEqual("GET");
    expect(this.server.requests[0].url)
      .toEqual("/things");
  });

  it("should parse things from the response", function() {
    this.things.fetch();
    this.server.respond();
    expect(this.things.length)
      .toEqual(this.fixture.response.things.length);
    expect(this.things.get(1).get('name'))
      .toEqual(this.fixture.response.things[0].name);
  });

});

