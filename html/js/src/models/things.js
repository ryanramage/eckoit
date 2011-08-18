this.Things = Backbone.Collection.extend({
    model: Thing,
    url: "/things",
    parse: function(res) {
      return res.response.things;
    },
    comparator: function(thing) {
      return thing.get("name");
    }
});