/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

(function( $ ) {

    var UPDATE_DATE_VIEWS      = "timeline.audioplayer.views.updatedate";
    var USER_DATE_CHANGE_EVENT = "timeline.audioplayer.datechange";
    var TIMELINE_DATE_EVENT = "timeline.audioplayer.date";

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

                wireupTimeline(settings, $this, calendar);


                var debouncedBroadcastNewDate = _.throttle(broadcastNewDate, settings.debounceRate)

                var lastDebouncedData;

                // do later
                $this.bind(USER_DATE_CHANGE_EVENT, function(e, data) {
                    lastDebouncedData = data;
                    debouncedBroadcastNewDate();
                    
                })




                var lastMonthMin;
                var lastMonthMax;
                var cachedEventIDs = {};

                function showEvents() {


                   // if (lastDebouncedData && lastDebouncedData.source == 'audioplayer') return;
                    var event_data = {
                        events : [
                        ]
                    };
                    // query the db
                    // get events for the widest net (usually just the calendar)
                    var eventwindow = findWidestEventWindow(settings.timeline, calendar, lastDebouncedData);


                    var updateData = _.after(2, function() {         
                        settings.timelineEventSource.clear();
                        settings.timelineEventSource.loadJSON(event_data, document.location.href);
                        //$this.trigger(NEW_RESULTS_CHANGE_EVENT, results);
                    });

                    
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
                        updateData();
                        
                    })

                    settings.eventProvider(eventwindow, function(results) {
                        if (results.timelineModel.length != 0) {

                            var finalCalendarModel = _.reject(results.calendarModel, function(event){ return cachedEventIDs[event.id] })
                            calendar.fullCalendar('addEventSource',finalCalendarModel).fullCalendar( 'rerenderEvents' );

                            var finalTimelineModel = [];
                            // normalize
                            $.each(results.timelineModel, function(i, event) {
            
                                    event.start = $.timelineaudioplayer.normalizeTimelineForDaylightSavings(event.start,settings.initalDate);
                                    event.end =   $.timelineaudioplayer.normalizeTimelineForDaylightSavings(event.end,  settings.initalDate);
                                    finalTimelineModel.push(event);
                                    cachedEventIDs[event.eventID] = true;

                            });
                            event_data.events = event_data.events.concat(finalTimelineModel);


                        }

                        
                        updateData();
                        
                    });
                }



                function broadcastNewDate() {
                    $this.trigger(UPDATE_DATE_VIEWS, lastDebouncedData);

                    if (lastDebouncedData && lastDebouncedData.source == 'audioplayer') return;

                    if (lastMonthMin != lastDebouncedData.minDate.getMonth() || lastMonthMax != lastDebouncedData.maxDate.getMonth()) {
                        showEvents();
                        lastMonthMin = lastDebouncedData.minDate.getMonth();
                        lastMonthMax = lastDebouncedData.maxDate.getMonth();
                    }
                }

                data = $this.data('timelineplayer', {
                    element : $this,
                    settings: settings
                });


                // onload, show envents
                showEvents();
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





    function wireupTimeline(settings, timelineElement, calendar) {

        var startDate = settings.initialDate;
        var internalDateChange = false;

        settings.timeline.getBand(1).addOnScrollListener(function(band) {
            if (internalDateChange) return;
            var minDate = $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getMinDate(), startDate);
            var maxDate = $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getMaxDate(), startDate);

            if (calendar) {
                var view = calendar.fullCalendar( 'getView' );
                minDate = view.visStart;
                maxDate = view.visEnd;
            }
            var update = {
                  source : 'timeline',
                  centreDate : $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getCenterVisibleDate(), startDate),
                  minDate : minDate,
                  maxDate : maxDate
            }

            timelineElement.trigger(USER_DATE_CHANGE_EVENT, update);
            timelineElement.trigger(TIMELINE_DATE_EVENT, update);
            
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


        function changeButtonDisplay(button, state) {
            if (state == 'playing') {
                button
                    .html('&#9632;')
                    .removeClass('seeking stopped ready')
                    .addClass('playing')
            }
            else if (state == 'ready' || state == 'stopped') {
                button
                    .html('&#9654;')
                    .removeClass('seeking playing  ready')
                    .addClass('stopped')
            }
            else if (state == 'seeking') {
                if (!button.hasClass('seeking')){
                    button
                        .html('<img src="images/spinner.gif" />')
                        .removeClass('playing  ready stopped')
                        .addClass('seeking')
                }
            }
        }


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
                state = 'stopped';

            }
            else if (state == 'ready' || state == 'stopped') {
                var centreDate = $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getCenterVisibleDate(), startDate);
                settings.audioDiv.liferecorder('play', centreDate);
                state = 'playing';
            }
            changeButtonDisplay(button, state);
        });


        var startDate = settings.initialDate;
        settings.audioDiv.liferecorder({
            documentPrefix : 'api',
            audioQuery : settings.audioQuery,
            audioNext  : settings.audioNext,
            onReady : function() {
                state = 'ready';
                changeButtonDisplay(button, state);
            }
        }).bind("liferecorder.update", function(e, date){
            if (aboutToUpdateDueToDragComplete) return;

            if (state != 'stopped') { // there seems to be an update lagging
                lastUpdateDate = date;
                throttleDateBroadcaster();
                state = 'playing';
                changeButtonDisplay(button, state);
            }

        }).bind("liferecorder.stopped", function() {
            if (aboutToUpdateDueToDragComplete) return;
            state = 'stopped';
            changeButtonDisplay(button, state);
        })

        var lastTimelineDate;



        var justInCaseNoDragFired;

        function timelineDragFinished() {
            internalDateChange = true;
            clearTimeout(justInCaseNoDragFired);

            lastUpdateDate = lastTimelineDate;
            if (!lastTimelineDate) {
                lastTimelineDate = $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getCenterVisibleDate(), startDate);
            }
            settings.audioDiv.liferecorder('play', lastTimelineDate);


            aboutToUpdateDueToDragComplete = false;
            setTimeout(function() {                
                internalDateChange = false
            }, 50);
            


        }

        var debouncedTimelineDragFinished = _.debounce(timelineDragFinished, 600);



        timelineElement.bind(UPDATE_DATE_VIEWS, function(e, data) {
            if (data.source == 'audioplayer') return;
            if (state != 'playing') return;
            aboutToUpdateDueToDragComplete = true;
            //debouncedTimelineDragFinished();
            justInCaseNoDragFired = setTimeout(timelineDragFinished, 500);
        });

        // wire right to timeline events
        settings.timeline.getBand(1).addOnScrollListener(function(band) {
            //if (state != 'playing') return;
            lastTimelineDate = $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getCenterVisibleDate(), startDate);
            if (!aboutToUpdateDueToDragComplete) return;
            clearTimeout(justInCaseNoDragFired);
            aboutToUpdateDueToDragComplete = true;
            internalDateChange = true;
            lastTimelineDate = $.timelineaudioplayer.denormalize(settings.timeline.getBand(1).getCenterVisibleDate(), startDate);
            debouncedTimelineDragFinished();

            state = 'seeking';            
            changeButtonDisplay(button, state);
            internalDateChange = false;


        });



    }



    function createCalendar(settings, timelineElement) {


        var internalDateChange = false;
        var CALENDAR_SOURCE = "calendar";


        var initialDate = settings.initialDate;

        var calendar = settings.calendarDiv.fullCalendar({
            header: {
                    left: 'prev ',
                    center: 'title',
                    right: 'next'
            },
            aspectRatio: 2,
            buttonIcons : false,
            buttonText : {
              prev : '&lt;',
              next : '&gt;'
            },
            weekMode : 'liquid',

            viewDisplay : function(view) {
                if (internalDateChange) return;

                var offsetHrs = 16;

                var date = new Date(view.start.getTime()).addHours(offsetHrs);


                var update = {
                      source : CALENDAR_SOURCE,
                      centreDate : date,
                      minDate : view.visStart,
                      maxDate : view.visEnd
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

                        var periodTotal = 0;
                        $('.fc-labels').remove();
                        $.each(tagCounts, function(i, count){

                           var calDayNum = view.visStart.getDaysBetween(count.date);
                           var baseDiv = $('.fc-day' + calDayNum);

                           var child = baseDiv.find('.fc-labels');
                           if (child.length == 0) {
                               child = $('<div class="fc-labels"></div>');
                               baseDiv.children().first().prepend(child);
                           }
                           child.text(count.count + ' tags');
                           periodTotal+=count.count;
                        });

                        $('.tag-total').text(periodTotal);

                    },
                    function(audioCounts) {

                        var periodTotal = 0;
                        $('.fc-labels-audio').remove();
                        $.each(audioCounts, function(i, count){

                           var calDayNum = view.visStart.getDaysBetween(count.date);
                           var baseDiv = $('.fc-day' + calDayNum);

                           var child = baseDiv.find('.fc-labels-audio');
                           if (child.length == 0) {
                               child = $('<div class="fc-labels-audio"></div>');
                               baseDiv.children().first().prepend(child);
                           }
                           periodTotal+=count.count;
                           child.text($.jPlayer.convertTime(count.count) + ' hrs');
                        });

                        var hrs = Math.round(periodTotal / (60 * 60))

                        $('.audio-total').text(hrs);
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
                      minDate : view.visStart,
                      maxDate : view.visEnd
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
                      minDate : view.visStart,
                      maxDate : view.visEnd
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

                // WARNING this will move the calendar bewteen months. Not what we ant.

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
                 //dateClone.addMinutes(diffMin);
                 
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
                 //dateClone.addMinutes(-diffMin);
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



