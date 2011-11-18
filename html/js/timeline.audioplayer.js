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
                    },
                    debounceRate : 300
                }

                $.extend( settings, options );

                // get the element
                var $this = $(this);

                

                if (settings.calendarDiv) {
                    createCalendar(settings, $this);
                }

                wireupTimeline(settings, $this);


                var debouncedBroadcastNewDate = _.debounce(broadcastNewDate, settings.debounceRate)

                var lastDebouncedData;

                // do later
                $this.bind(USER_DATE_CHANGE_EVENT, function(e, data) {
                    lastDebouncedData = data;
                    debouncedBroadcastNewDate();
                    
                })

                function broadcastNewDate() {
                    $this.trigger(UPDATE_DATE_VIEWS, lastDebouncedData);
                }



            });
        }
    }


    function normalizeTimelineForDaylightSavings(dateToFix, initialDate) {
        // if the offset is different than the inital date, we bump it
        var firstOffset = dateToFix.getTimezoneOffset();
        var secondOffset = initialDate.getTimezoneOffset();
        if (firstOffset != secondOffset) {

            var diffMin = secondOffset - firstOffset  ;
             dateToFix.addMinutes(diffMin);
            return dateToFix;
        }
        return dateToFix;
    }

    function denormalize(dateToFix, initialDate) {
                // if the offset is different than the inital date, we bump it
        var firstOffset = dateToFix.getTimezoneOffset();
        var secondOffset = initialDate.getTimezoneOffset();
        if (firstOffset != secondOffset) {

            var diffMin = secondOffset - firstOffset  ;
             dateToFix.addMinutes(-diffMin);
            return dateToFix;
        }
        return dateToFix;
    }


    function wireupTimeline(settings, timelineElement) {

        var startDate = settings.initialDate;
        var internalDateChange = false;

        settings.timeline.getBand(0).addOnScrollListener(function(band) {
            if (internalDateChange) return;
            normalizeTimelineForDaylightSavings(settings.timeline.getBand(0).getCenterVisibleDate(), startDate);
            var update = {
                  source : 'timeline',
                  centreDate : denormalize(settings.timeline.getBand(0).getCenterVisibleDate(), startDate),
                  minDate : denormalize(settings.timeline.getBand(0).getMinDate(), startDate),
                  maxDate : denormalize(settings.timeline.getBand(0).getMaxDate(), startDate)
            }

            timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
            
        });

        timelineElement.bind(UPDATE_DATE_VIEWS, function(e, data) {
            if (data.source != 'timeline') {
                internalDateChange = true;
                //this is a hack around timeline. 
                var normal = normalizeTimelineForDaylightSavings(data.centreDate, startDate);
                settings.timeline.getBand(0).setCenterVisibleDate(normal);
                internalDateChange = false;
            }
        });

    }



    function createCalendar(settings, timelineElement) {


        var internalDateChange = false;
        var CALENDAR_SOURCE = "calendar";


        var initialDate = settings.initialDate;

        settings.calendarDiv.fullCalendar({
            header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek'
            },
            events: [
                {
                    title: 'Event1',
                    start: new Date()
                },
                {
                    title: 'Event2',
                    start: '2011-11-01'
                }
            ],
            aspectRatio: 2,
            viewDisplay : function(view) {
                if (internalDateChange) return;

                var update = {
                      source : CALENDAR_SOURCE,
                      centreDate : view.start,
                      minDate : view.start,
                      maxDate : view.end
                }

                timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
                
            },
            select : function(startDate, endDate, allDay, jsEvent, view) {
                if (internalDateChange) return;

                var update = {
                      source : CALENDAR_SOURCE,
                      centreDate : startDate,
                      minDate : startDate,
                      maxDate : endDate
                }

                timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
            },
            eventClick: function(calEvent, jsEvent, view) {
                var update = {
                      source : CALENDAR_SOURCE,
                      centreDate : calEvent.start,
                      minDate : calEvent.start,
                      maxDate : null
                }

                timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
            },
            selectable: true,
            unselectAuto: false,
            editable: true


        }).fullCalendar('gotoDate', initialDate);

        timelineElement.bind(UPDATE_DATE_VIEWS, function(e, data) {
            if (data.source != 'calendar') {
                internalDateChange = true;

                console.log('setting cal: ', data.centreDate.toString());

                settings.calendarDiv.fullCalendar('gotoDate', data.centreDate);
                settings.calendarDiv.fullCalendar('select', data.centreDate, data.endDate, true);
                internalDateChange = false;
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



