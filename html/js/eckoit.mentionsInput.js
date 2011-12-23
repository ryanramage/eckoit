/**
 * This mainly wraps the jquery.mentionsInput
 */
(function( $ ) {


    var methods = {
        init : function(options) {
            return this.each(function() {

                if (!options || !options.app) {
                    $.error( 'please provide an app object' );
                }
                var settings = {

                }

                $.extend( settings, options );


                var queryTags = function(query) {

                }

                var queryPeople = function(query, callback) {
                    app.controller.searchPeople(query, function(results) {
                        var people = [];
                        if (results.rows) {
                            people = _.map(results.rows, function(row){
                                return {
                                  id : row.id,
                                  name : row.key,
                                  type : 'person'
                                };
                            });
                        }
                        callback.call(this, people);
                    });
                }



                $(this).mentionsInput({
                    triggerChar : ['#', '@'],
                    onDataRequest : function(mode, query, callback, triggerChar) {
                        if (triggerChar === '#') {

                        }
                        if (triggerChar === '@') {
                            queryPeople.call(this, query, callback);
                        }                        
                    }
                });


            });
        }
    }


    // bind to the jQuery object, dispatch names to methods
    $.fn.eckoitMentionsInput = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.eckoitMentionsInput');
        }
    }


}(jQuery));



