var app = app || {};


app.controller = app.controller || {};

app.controller.current = "";


app.controller.on = function(page, params) {
    $('.maintabs li').removeClass('active');
    $('.maintabs .' + page).addClass('active');
    var template = page + 'Template';
    try {
        $('.main').html( ich[template]()  );
    } catch (e) {}
}




