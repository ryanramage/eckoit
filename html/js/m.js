var app = app || {};


app.controller = app.controller || {};



app.controller.init = function(details) {
    if (!details.tag_groups) return;
    $.each(details.tag_groups, function(i, group) {
        app.controller.addTagGroup(group);
    });

    app.controller.showTagGroup(details.tag_groups[0]);

}


app.controller.addTagGroup = function(group) {
    var content = $('<li><a href="#"  class="tab  '+group.name+'" >'+ group.name+ '</a></li>');
    $('.tag-groups').append(content);
    content.find('a').click(function() {
        app.controller.showTagGroup(group);
        $('.tag-group-tags').trigger('create');
        $(window).trigger('resize');
    });
}


app.controller.showTagGroup = function(group) {
    $('.tag-group-tags').empty();
    $.each(group.tags, function(i, tag) {
        
        var name = tag.name;
        $('.tag-group-tags').append('<input type="checkbox" name="'+name+'" id="'+name+'" class="custom" /><label for="'+name+'">'+ name +'</label>');


    });
    $('.' + group.name).addClass('ui-btn-active');
}



$('#utag').live('pagecreate',function(event){
      var details = {
        tag_groups: [
            {
                name: "Home",
                tags : [
                    {
                        name: "Funny"
                    },
                    {
                        name : "Helarity"
                    }
                ]
            },
            {
                name : "Work",
                tags : [
                    {
                        name : "Todo"
                    },
                    {
                        name : "Delegate"
                    },
                    {
                        name : "Earthy"
                    }
                ]
            }
        ]
    };
    app.controller.init(details);
});


$(function() {

    $('.tab').live('click', function() {
        $('.tab').removeClass('ui-btn-active');
        $(this).addClass('ui-btn-active');
        return false;
    })









});