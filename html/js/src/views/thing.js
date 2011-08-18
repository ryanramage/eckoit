this.ThingView = Backbone.View.extend({
  
  tagName: "li",
  
  initialize: function(options) {
    _.bindAll(this, "edit");
    this.template = options.template || "";
  },
  
  render: function() {
    $(this.el).html(Mustache.to_html(this.template, this.model.toJSON()));
    return this;
  },

  events: {
    "click a.edit": "edit"
  },

  edit: function() {
    this.$('h2').fadeOut(500);
    this.$('input.edit').fadeIn(500);
  }
  
});