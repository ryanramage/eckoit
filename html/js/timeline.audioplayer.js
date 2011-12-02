/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

(function( $ ) {

    var UPDATE_DATE_VIEWS      = "timeline.audioplayer.views.updatedate";
    var USER_DATE_CHANGE_EVENT = "timeline.audioplayer.datechange";
    var NEW_RESULTS_CHANGE_EVENT = "timeline.audioplayer.resultschange";

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
                    eventProvider : function(date_change_event, callback) {
                        callback([]);
                    },
                    audioProvider : function(date_change_event, callback) {
                        callback([]);
                    },
                    dayStatsProvider : function(startDate, endDate, tagCountsCallback, audioCountsCallback) {
                        tagCountsCallback([]);
                        audioCountsCallback([]);
                    },
                    debounceRate : 300
                }

                $.extend( settings, options );

                // get the element
                var $this = $(this);

                
                var calendar;
                if (settings.calendarDiv) {
                    calendar = createCalendar(settings, $this);
                }

                var audioplayer;
                if (settings.audioDiv) {
                    audioplayer = createAudioPlayer(settings, $this);
                }

                wireupTimeline(settings, $this);


                var debouncedBroadcastNewDate = _.throttle(broadcastNewDate, settings.debounceRate)

                var lastDebouncedData;

                // do later
                $this.bind(USER_DATE_CHANGE_EVENT, function(e, data) {
                    lastDebouncedData = data;
                    debouncedBroadcastNewDate();
                    
                })

                var event_data = {
                    events : [
                    ]
                };


                function showEvents() {

                    if (lastDebouncedData && lastDebouncedData.source == 'audioplayer') return;

                    // query the db
                    // get events for the widest net (usually just the calendar)
                    var eventwindow = findWidestEventWindow(settings.timeline, calendar, lastDebouncedData);
                    settings.audioProvider(eventwindow, function(results) {
                        // show dem
                        //settings.timelineEventSource..clear();

                        // normalize
                        $.each(results, function(i, recording) {

                            if (!recording) return;
                            recording.start = $.timelineaudioplayer.normalizeTimelineForDaylightSavings(recording.start,settings.initalDate);
                            recording.end =   $.timelineaudioplayer.normalizeTimelineForDaylightSavings(recording.end,  settings.initalDate);

                        });


                        event_data.events = event_data.events.concat(results.recordings);
                        settings.timelineEventSource.clear();
                        settings.timelineEventSource.loadJSON(event_data, document.location.href);
                        $this.trigger(NEW_RESULTS_CHANGE_EVENT, results);
                    })

                    settings.eventProvider(eventwindow, function(results) {
                        if (results.timelineModel.length == 0) return;

                        // normalize
                        $.each(results, function(i, event) {
                            event.start = $.timelineaudioplayer.normalizeTimelineForDaylightSavings(event.start,settings.initalDate);
                            event.end =   $.timelineaudioplayer.normalizeTimelineForDaylightSavings(event.end,  settings.initalDate);

                        });


                        event_data.events = event_data.events.concat(results.timelineModel);
                        settings.timelineEventSource.clear();
                        settings.timelineEventSource.loadJSON(event_data, document.location.href);
                        //$this.trigger(NEW_RESULTS_CHANGE_EVENT, results);
                        calendar.fullCalendar('addEventSource',results.calendarModel).fullCalendar( 'rerenderEvents' )
                    });
                }


                function broadcastNewDate() {
                    $this.trigger(UPDATE_DATE_VIEWS, lastDebouncedData);
                    showEvents();
                }
                // onload, show envents
                showEvents();
                data = $this.data('timelineplayer', {
                    element : $this,
                    settings: settings
                });
            });
        },
        timeline : function() {
             return $(this).data('timelineplayer').settings.timeline;
        },
        destroy : function() {
            $(this).data('timelineplayer').settings.calendarDiv.fullCalendar('destroy');
        }
    }


    function findWidestEventWindow(timeline, calendar, lastDebouncedData) {
        if (!lastDebouncedData) lastDebouncedData = {};

        if (calendar) {
            var view = calendar.fullCalendar( 'getView' );
            lastDebouncedData.minDate = view.visStart;
            lastDebouncedData.maxDate = view.visEnd;
        } else {
            
        }
        return lastDebouncedData;
    }





    function wireupTimeline(settings, timelineElement) {

        var startDate = settings.initialDate;
        var internalDateChange = false;

        settings.timeline.getBand(1).addOnScrollListener(function(band) {
            if (internalDateChange) return;
            var update = {
                  source : 'timeline',
                  centreDate : $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getCenterVisibleDate(), startDate),
                  minDate : $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getMinDate(), startDate),
                  maxDate : $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getMaxDate(), startDate)
            }

            timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
            
        });

        timelineElement.bind(UPDATE_DATE_VIEWS, function(e, data) {
            if (data.source != 'timeline') {
                internalDateChange = true;
                //this is a hack around timeline. 
                var normal = $.timelineaudioplayer.normalizeTimelineForDaylightSavings(data.centreDate, startDate);
                settings.timeline.getBand(1).setCenterVisibleDate(normal);
                //settings.timeline.getBand(0).scrollToCenter(normal);
                internalDateChange = false;
            }
        });

    }


    function createAudioPlayer(settings, timelineElement) {

        var internalDateChange = false;
        var lastUpdateDate;
        var aboutToUpdateDueToDragComplete = false;

        function dateBroadcaster() {
            if (internalDateChange) return;
            var update = {
                  source : 'audioplayer',
                  centreDate : lastUpdateDate,
                  minDate : lastUpdateDate,
                  maxDate : lastUpdateDate
            }
            if (!aboutToUpdateDueToDragComplete) {

                timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
            }
        }

        var throttleDateBroadcaster = _.throttle(dateBroadcaster, 1000);


        var button = $('<div class="playbutton">&#9658;</div>')
        settings.audioDiv.append(button);


        var state = 'loading';

        button.bind('click', function() {
            if (state == 'playing') {
                settings.audioDiv.liferecorder('stop');
                button.html('&#9654;');
                state = 'stopped';
            }
            else if (state == 'ready' || state == 'stopped') {
                button.html('&#9632;');
                var centreDate = $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getCenterVisibleDate(), startDate);
                settings.audioDiv.liferecorder('play', centreDate);
                state = 'playing';
            }
        });


        var startDate = settings.initialDate;
        settings.audioDiv.liferecorder({
            documentPrefix : 'api',
            audioQuery : settings.audioQuery,
            audioNext  : settings.audioNext,
            onReady : function() {
                state = 'ready';
                button.html('&#9654;');
            }
        }).bind("liferecorder.update", function(e, date){
            if (aboutToUpdateDueToDragComplete) return;
            lastUpdateDate = date;
            throttleDateBroadcaster();
        });

        var lastTimelineDate;

        function timelineDragFinished() {
            lastUpdateDate = lastTimelineDate;
            settings.audioDiv.liferecorder('play', lastTimelineDate);
            setTimeout(function() {
                aboutToUpdateDueToDragComplete = false;
                //dateBroadcaster();
            }, 100)
        }

        var debouncedTimelineDragFinished = _.debounce(timelineDragFinished, 1000);

        timelineElement.bind(UPDATE_DATE_VIEWS, function(e, data) {
            if (data.source == 'audioplayer') return;
            if (state != 'playing') return;
            aboutToUpdateDueToDragComplete = true;
            internalDateChange = true;
            lastTimelineDate = data.centreDate;
            debouncedTimelineDragFinished();
            internalDateChange = false;
        });

    }



    function createCalendar(settings, timelineElement) {


        var internalDateChange = false;
        var CALENDAR_SOURCE = "calendar";


        var initialDate = settings.initialDate;

        var calendar = settings.calendarDiv.fullCalendar({
            header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek'
            },
            aspectRatio: 2,
            buttonIcons : false,
            buttonText : {
              prev : '&lt;',
              next : '&gt;'
            },

            viewDisplay : function(view) {
                if (internalDateChange) return;

                var offsetHrs = 16;

                var date = new Date(view.start.getTime()).addHours(offsetHrs);


                var update = {
                      source : CALENDAR_SOURCE,
                      centreDate : date,
                      minDate : view.start,
                      maxDate : view.end
                }

                if (view && view.name == "agendaWeek") {
                    var today = new Date();
                    if (today.between(view.start,  view.end)) {
                        update.centreDate = today;
                    }
                }
                timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);

                // update the stats
                settings.dayStatsProvider(view.visStart, view.visEnd, 
                    function(tagCounts) {

                        $('.fc-labels').remove();
                        $.each(tagCounts, function(i, count){

                           var calDayNum = view.visStart.getDaysBetween(count.date);
                           var baseDiv = $('.fc-day' + calDayNum);

                           var child = baseDiv.find('.fc-labels');
                           if (child.length == 0) {
                               child = $('<div class="fc-labels"></div>');
                               baseDiv.children().first().prepend(child);
                           }
                           child.text(count.count);

                        });

                    },
                    function(audioCounts) {

                    }
                );


                
            },
            select : function(startDate, endDate, allDay, jsEvent, view) {
                if (internalDateChange) return;

                var offsetHrs = 0;

                if (view && view.name == "month") {
                    // add 16hrs. Shows 4pm to give best full view of day
                    offsetHrs = 16;
                }
                var update = {
                      source : CALENDAR_SOURCE,
                      centreDate : startDate.addHours(offsetHrs),
                      minDate : view.start,
                      maxDate : view.end
                }

                timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
            },
            eventClick: function(calEvent, jsEvent, view) {

                var offsetHrs = 0;

                if (calEvent.allDay) {
                    // add 9hrs. gives a good start to the day
                    offsetHrs = 9;
                }

                var date = new Date(calEvent.start.getTime()).addHours(offsetHrs);

                var update = {
                      source : CALENDAR_SOURCE,
                      centreDate : date,
                      minDate : date,
                      maxDate : null
                }



                timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
            },
            selectable: true,
            unselectAuto: false,
            editable: true,
            events: [

                // more events here
            ],
            // can alter the event here
            eventRender: function(event, element) {
                
            }


        }).fullCalendar('gotoDate', initialDate)
          .fullCalendar('select', initialDate, initialDate, true);

        timelineElement.bind(UPDATE_DATE_VIEWS, function(e, data) {
            internalDateChange = true;
            if (!data._calupdate) {

                // WARNING this will move the calendar bewteen months. Now what we ant.

                settings.calendarDiv.fullCalendar('select', data.centreDate, data.endDate, false);
                data._calupdate = true;
            }
            if (data.source != 'calendar') {
 

                settings.calendarDiv.fullCalendar('gotoDate', data.centreDate);
                settings.calendarDiv.fullCalendar('select', data.centreDate, data.endDate, false);
            }
            internalDateChange = false;
        });
        return calendar;


    }



    $.timelineaudioplayer = {
         normalizeTimelineForDaylightSavings : function(dateToFix, initialDate) {

            if (!dateToFix) return null;
            if (!initialDate) initialDate = new Date();

            var dateClone = new Date(dateToFix);


            // if the offset is different than the inital date, we bump it
            var firstOffset = dateClone.getTimezoneOffset();
            var secondOffset = initialDate.getTimezoneOffset();
            if (firstOffset != secondOffset) {

                var diffMin = secondOffset - firstOffset  ;
                 dateClone.addMinutes(diffMin);
                 
                return dateClone;
            }
            return dateToFix;
        },

        denormalize : function(dateToFix, initialDate) {
            // if the offset is different than the inital date, we bump it
            var dateClone = new Date(dateToFix.getTime());
            var firstOffset = dateClone.getTimezoneOffset();
            var secondOffset = initialDate.getTimezoneOffset();
            if (firstOffset != secondOffset) {

                var diffMin = secondOffset - firstOffset  ;
                 dateClone.addMinutes(-diffMin);
                return dateClone;
            }
            return dateToFix;
        }
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



