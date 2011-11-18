/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

(function( $ ) {

    var UPDATE_DATE_VIEWS      = "timeline.audioplayer.views.updatedate";
    var USER_DATE_CHANGE_EVENT = "timeline.audioplayer.datechange";

    var DATE_CHANGE_EVENT_TEMPLATE = {
        source : 'timeline',
        centreDate : new Date(),
        minDate : null,
        maxDate : null
    }


    var methods = {
        init : function(options) {
            return this.each(function() {

                // sort out the options
                if (!options || !options.timeline) {
                    $.error( 'please provide a configured timeline' );
                }

                var settings = {
                    swfPath: "/js/jPlayer",
                    initialDate : new Date(),
                    eventProvider : function(startDate, endDate) {
                        return [];
                    }
                }

                $.extend( settings, options );

                // get the element
                var $this = $(this);

                

                if (settings.calendarDiv) {
                    createCalendar(settings, $this);
                }

                options.timeline.getBand(0).addOnScrollListener(function(band) {

                    var update = {
                          centreDate : options.timeline.getBand(0).getCenterVisibleDate(),
                          minDate : options.timeline.getBand(0).getMinDate(),
                          maxDate : options.timeline.getBand(0).getMaxDate()
                    }

                    $.extend(DATE_CHANGE_EVENT_TEMPLATE, update);
                    $this.trigger(USER_DATE_CHANGE_EVENT, update);


                });


                var debouncedBroadcastNewDate = _.debounce(broadcastNewDate, 500)

                var lastDebouncedData;

                // do later
                $this.bind(USER_DATE_CHANGE_EVENT, function(e, data) {
                    lastDebouncedData = data;
                    debouncedBroadcastNewDate();
                    
                })

                function broadcastNewDate() {
                    console.log('user date change', lastDebouncedData);
                    $this.trigger(UPDATE_DATE_VIEWS, lastDebouncedData);
                }



            });
        }
    }







    function createCalendar(settings, timelineElement) {

        var CALENDAR_SOURCE = "calendar";


        var initialDate = settings.initialDate;

        settings.calendarDiv.fullCalendar({
            header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek'
            },

            viewDisplay : function(view) {
                // called when the view is shown AND changed
                //console.log(view.start.toString());
                //console.log(view.end.toString());

                var update = {
                      source : CALENDAR_SOURCE,
                      centreDate : view.start,
                      minDate : view.start,
                      maxDate : view.end
                }

                $.extend(DATE_CHANGE_EVENT_TEMPLATE, update);
                timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
                
            },
            select : function(startDate, endDate, allDay, jsEvent, view) {
                var update = {
                      source : CALENDAR_SOURCE,
                      centreDate : startDate,
                      minDate : startDate,
                      maxDate : endDate
                }

                $.extend(DATE_CHANGE_EVENT_TEMPLATE, update);


                timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
            },

            selectable: true,
            unselectAuto: false,
            editable: true


        }).fullCalendar('gotoDate', initialDate);

        timelineElement.bind(UPDATE_DATE_VIEWS, function(e, data) {
            if (data.source !== CALENDAR_SOURCE) {
                settings.calendarDiv.fullCalendar('gotoDate', data.centreDate);
                settings.calendarDiv.fullCalendar('select', data.centreDate, data.endDate, true);
            }
        });



    }







    // bind to the jQuery object, dispatch names to methods
    $.fn.timelineaudioplayer = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.couchaudiostreamer');
        }
    }


}(jQuery));



