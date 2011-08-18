describe('Thing model', function() {

  beforeEach(function() {
    this.server = sinon.fakeServer.create();
  });
    
  afterEach(function() {
    this.server.restore();
  });
  
  describe('when instantiated', function() {
    
    it("should have default attributes", function() {
      var thing = new Thing();
      expect(thing.get('name')).toEqual('no name');
    });
    
    it('should exhibit attributes', function() {
      var thing = new Thing({ name: 'Attractively painted bottoms' });
      expect(thing.get('name')).toEqual('Attractively painted bottoms');
    });
    
    // spy testing with Sinon.js
    it("should fire a callback when 'foo' is triggered", function() {
      // Create an anonymous spy
      var spy = sinon.spy();

      // Create a new Backbone 'Episode' model
      var thing = new Thing({ name: 'Attractively painted bottoms' });

      // Call the anonymous spy method when 'foo' is triggered
      thing.bind('foo', spy); 

      // Trigger the foo event
      thing.trigger('foo'); 

      // Expect that the spy was called at least once
      // sinon.assert.calledOnce(spy);
      expect(spy.called).toBeTruthy();
      
    });
    
    it("should make the correct server request", function() {
      
      var thing = new Thing({
        id: 1,
        name: "Attractively painted bottoms", 
        url: "/thing/1"
      });
      
      // Spy on jQuery's ajax method
      var spy = sinon.spy(jQuery, 'ajax');
      
      // Save the model
      thing.save();
      
      // Spy was called
      expect(spy.called).toBeTruthy();
      
      // Check url property of first argument
      expect(spy.getCall(0).args[0].url)
        .toEqual("/thing/1");
      
      // Restore jQuery.ajax to normal
      jQuery.ajax.restore();
      
    });
    
    it("should fire the change event", function() {
      
      // Set how the fake server will respond
      // This reads: a GET request for /thing/123 
      // will return a 200 response of type 
      // application/json with the given JSON response body
      this.server.respondWith("GET", "/thing/123",
        [200, {"Content-Type": "application/json"},
        '{"id":123,"name":"Attractively painted bottoms"}']);

      var callback = sinon.spy();

      var thing = new Thing({ id: 123 });

      // Bind to the change event on the model
      thing.bind('change', callback);

      // makes an ajax request to the server
      thing.fetch(); 

      // Fake server responds to the request
      this.server.respond(); 

      // Expect that the spy was called with the new model
      expect(callback.called).toBeTruthy();
      
      expect(callback.getCall(0).args[0].attributes)
        .toEqual({
          id: 123,
          name: "Attractively painted bottoms"
        });

      });

    });
    
    it("should set the URL to the collection URL", function() {
      
      var Poo = Backbone.Model.extend({});
      var collection = {
        url: "/poo"
      };
      var poo = new Poo();
      poo.collection = collection;
      expect(poo.url()).toEqual("/poo");

      // do me another test with the id set.
      poo.id = 1;
      expect(poo.url()).toEqual("/poo/1");
      
      
    });

    it("should not save when title is empty", function() {
      var thing = new Thing({ id: 123 });
      var eventSpy = sinon.spy();
      thing.bind("error", eventSpy);
      thing.save({ "name": "" });
      // we're going to use matchers from jasmine-sinon.js
      expect(eventSpy).toHaveBeenCalledOnce();
      expect(eventSpy).toHaveBeenCalledWith(
        thing,
        "cannot have an empty name"
      );
    });

    it("should create models based upon the collection", function() {
      var Animal = Backbone.Model.extend();
      var Zoo = Backbone.Collection.extend({
        model: Animal
      });
      var edinburghZoo = new Zoo([
        {name:"Panda"},
        {name:"Penguin"}
      ]);
      expect(edinburghZoo.at(0).get("name")).toBe("Panda");
    });

});
