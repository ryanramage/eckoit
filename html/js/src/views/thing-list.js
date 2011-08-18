this.ThingListView = Backbone.View.extend({
  
  tagName: "ul",
  
  className: "things",
  
  initialize: function() {
    _.bindAll(this, "addThing");
  },

  render: function() {
    this.collection.each(this.addThing);
  },
  
  addThing: function(thing) {
    var view = new ThingView({model: thing});
    var thingEl = view.render().el;
    $(this.el).append(thingEl);
  }

});