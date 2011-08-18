this.AppRouter = Backbone.Router.extend({
  
  routes: {
    "":           "index",  // #index
    "thing/:id":  "thing"   // e.g. #thing/123
  },
  
  index: function() {
    this.things = new Things();
    this.thingsView = new ThingListView({
      collection: this.things
    });
    this.things.fetch();
  },
  
  thing: function(id) {}
  
});