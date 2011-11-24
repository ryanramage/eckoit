var app = app || {};


app.controller = app.controller || {};



app.controller.save = app.controller.save || {};


app.controller.save.topic = function() {
   
}



app.view = {};

app.ddoc = "app2";

app.view.current = "";


app.view.mainPageChange = function(page, data) {

    data = data || {};
    var template = page + 'Template';
    try {
        $('.main').html( ich[template](data)  );
        app.view.current = page;
    } catch (e) {}
}


app.view.activeCategory = function(category) {
    $('.maintabs li').removeClass('active');
    $('.maintabs .' + category).addClass('active');
}



app.onDomReady = function() {
    $('.votes').live('click', function() {
        var $me = $(this);
        var id = $me.data('id');
        app.controller.bumpVotes(id, function(newCount) {
            $me.find('.mini-counts').text(newCount);
        }, function(error) {

        });
    })

    $('')

}


app.controller.bumpVotes = function(id, callback, error) {
    $.post('api/_design/'+ app.ddoc +'/_update/bumpVotes/' + id, function(result) {
        callback(result);
    })
}


app.controller.bumpViews = function(id, callback, error) {
    $.post('api/_design/'+ app.ddoc +'/_update/bumpViews/' + id, function(result) {
        callback(result);
    })
}



app.findBestTag = function(tags) {

    if (!tags || tags.length == 0) return null;
    if (tags.length == 1) return tags[0];
    // in the future, we can query to find the smallest tag set.
    return tags[0];
}


app.findExtraKeys = function(tags, bestTag) {
    if (!tags || tags.length == 0) return null;
    if (tags.length == 1) return null;
    var extraKeys = [];
    for (var i=0; i < tags.length; i++) {
        var tag = tags[i];
        if (tag != bestTag) extraKeys.push(tag);
    }
    return extraKeys;
}

app.controller.findTopics = function(tags, callback, sort) {
    if (!sort) sort = 0;

    if (!tags) {
        $.couch.db('').view(app.ddoc + '/unfiltered', {
            startkey : [sort, {}],
            endkey : [sort],
            descending : true,
            include_docs : true,
            reduce: false,
            success : callback
        });
    } else {

        var tag = app.findBestTag(tags);
        var options = {
            startkey : [tag, sort, {}],
            endkey : [tag, sort],
            descending : true,
            include_docs : true,
            reduce: false
            
        };

        var extra_keys = app.findExtraKeys(tags, tag);
        if (extra_keys) {
            options.extra_keys = JSON.stringify(extra_keys);
        }
        $.couch.db('').list(app.ddoc + '/intersection', 'byTag', options, {
            success : callback,
            dataType: 'json'
        });

    }
}



app.controller.findDistinctTags = function(results, filterTags) {
    var tag_arr = _.map(results.rows, function(row){return row.doc.tags});
    var tags = _.union(tag_arr);

    if (filterTags) {

        tags = _.difference(tags, filterTags);

    }

    return tags
}


app.view.showDistinctTags = function(tags) {
    $('.related.unstyled').html( ich['relatedTagsTemplate']( {tags : tags} )  );
}



app.view.showTopics = function(results) {

    var div = $('.row.topics');
    app.controller.showTopics(results, div);
    $("time.timeago").timeago();
}


app.view.typeToTemplate = {
    "com.eckoit.utag" : "timelineRowTemplate"
}



app.controller.showTopics = function(results, div) {
    div.empty();
    $.each(results.rows, function(i,row) {
       var doc = row.doc;
       app.controller.showTopic(doc, div);
    });
}


app.controller.showTopic = function(topic, div) {
    if (!topic.type) return;
    var template = app.view.typeToTemplate[topic.type];
    if (!template) return;

    if (topic.timestamp) {
        topic.datestamp = new Date(topic.timestamp);
        topic.datestamp_iso = iso8601(topic.datestamp);
        topic.datestamp_string = topic.datestamp.toLocaleString();
        topic.datestamp_link = $.fullCalendar.formatDate(topic.datestamp, "d-MMM-yyyy_h:mm:ss_tt");
    }

    div.append( ich[template](topic)  );
    
}



app.controller.findClosest =  function getClosest(geohash, resolution, callbackBlock, callbackComplete) {

    if (resolution) {
        geohash = geohash.substr(0,resolution);
    }


   var neighbors = {};
   neighbors.center = geohash;
   neighbors.top = GeoHash.calculateAdjacent(geohash,'top');
   neighbors.bottom = GeoHash.calculateAdjacent(geohash,'bottom');
   neighbors.right = GeoHash.calculateAdjacent(geohash,'right');
   neighbors.left = GeoHash.calculateAdjacent(geohash,'left');
   neighbors.topleft = GeoHash.calculateAdjacent(neighbors.left,'top');
   neighbors.topright = GeoHash.calculateAdjacent(neighbors.right,'top');
   neighbors.bottomright = GeoHash.calculateAdjacent(neighbors.right,'bottom');
   neighbors.bottomleft = GeoHash.calculateAdjacent(neighbors.left,'bottom');

   var finished = _.after(9, callbackComplete)

   // massive query
   var c = 1;
   _.each(neighbors, function(localhash, spot) {
        var deferred = function() {
            $.couch.db('').view(app.ddoc + '/byGeohashExact', {
                startkey : [localhash,{}],
                endkey : [localhash],
                descending : true,
                reduce : false,
                limit : 10,
                include_docs : true,
                success : function(results) {
                   if (results.rows && results.rows.length > 0) {
                        callbackBlock(results.rows);
                   }
                   finished();
                }
            });
        }
        _.delay(deferred, 100 * c++);
   });

}


app.controller.parseRequestedDate = function(date) {

	date = unescape(date);
        date = date.replace(/_/g," ");
        var resultDate = new Date(Date.parse(date));
        if (!resultDate) {
            resultDate = new Date(date);
        }

        return resultDate;
	
}

app.controller.loadedAudio = {};

app.controller.timelineAudio = function(minDate, maxDate, centreDate, callback) {



    $.couch.db('').view(app.ddoc + '/audio_by_time', {
        startkey :  minDate.getTime(),
        endkey : maxDate.getTime(),
        error : function() {

        },
        success : function(results) {

            var centerItem;
            var recordings = [];
            $.each(results.rows, function(i, item) {
                if (app.controller.loadedAudio[item.id]) return;

                if (item.value.start <= centreDate.getTime() && centreDate.getTime() <= item.value.end ) {
                    centerItem = item;
                }

                var recording =  {
                    eventID: item.id,
                    start: $.timelineaudioplayer.normalizeTimelineForDaylightSavings(new Date(item.value.start)),
                    end: $.timelineaudioplayer.normalizeTimelineForDaylightSavings(new Date(item.value.end)),
                    durationEvent : true,
                    title : "",
                    caption : "Recording",
                    trackNum : 1
                }
                recordings.push(recording);
                app.controller.loadedAudio[item.id] = true;
            });
            callback({
                recordings: recordings,
                centerItem : centerItem
            });
        }
    })
}

 app.controller.tagToTimelineMarkerTitle = function (tag) {
    var tagString = "Mark";
    if (tag.tags) {
        tagString = _.reduce(tag.tags, function(memo, tag){return memo + ',' + tag}, '').substring(1);

    }
    var title = " [" + tagString +"]";
    if (tag.text) {
        title = tag.text + " [" + tagString +"]";
    }
    return title;
}

app.controller.typeToTimelineModel = {
    "com.eckoit.utag" : function(doc) {
        var base = {
            eventID: doc._id,
            start: $.timelineaudioplayer.normalizeTimelineForDaylightSavings(new Date(doc.timestamp)),
            durationEvent : false,
            //end : new Date(item.value.end),
            title : app.controller.tagToTimelineMarkerTitle(doc),

            caption : "uTag"

        };
        if (doc.duration) {
            base.end = $.timelineaudioplayer.normalizeTimelineForDaylightSavings(new Date(doc.timestamp + doc.length));
        }

        
        //if(isTagNotEdited(item.value)) {
        //    base.classname = 'untagged';
       // }
        return base;
    },
    "com.eckoit.liferecorder.mark" : function(doc) {

        var base = {
            eventID: doc._id,
            start: $.timelineaudioplayer.normalizeTimelineForDaylightSavings(new Date(doc.timestamp)),
            end :  $.timelineaudioplayer.normalizeTimelineForDaylightSavings(new Date(doc.timestamp + doc.mark.length)),
            durationEvent : false,
            //end : new Date(item.value.end),
            title : app.controller.tagToTimelineMarkerTitle(doc),
            
            caption : "Liferecorder Mark"

        };

        //if(isTagNotEdited(item.value)) {
        //    base.classname = 'untagged';
       // }

        return base;
    }
}


app.controller.isEventLength = function(start, end) {
    if (!end) return false;
    // if it is greater than 15 min, that is event for me.
    if ((end.getTime() - start.getTime()) > (15 * 60 * 1000)) {
        return true;
    }
    return false;
}


app.controller.typeToCalendarModel = {
    "com.eckoit.utag" : function(doc) {

        var base = {
            id: doc._id,
            title : app.controller.tagToTimelineMarkerTitle(doc),
            start: new Date(doc.timestamp),
            allDay : false
        }
        if (doc.duration) {
            base.end = new Date(doc.timestamp + doc.length)
        }
        if (app.controller.isEventLength(base.start, base.end)) {
            return base;
        }
   
    },
    "com.eckoit.liferecorder.mark" : function(doc) {
        var base = {
            id: doc._id,
            title : app.controller.tagToTimelineMarkerTitle(doc),
            start: new Date(doc.timestamp),
            end :  new Date(doc.timestamp + doc.mark.length),
            allDay : false
        }

        if (app.controller.isEventLength(base.start, base.end)) {
            return base;
        }

        
    }
}


app.controller.loadedEvents = {};

app.controller.timelineEvents = function(minDate, maxDate, callback, reload) {
   $.couch.db('').view(app.ddoc + '/timeline_stuff', {
        startkey :  minDate.getTime(),
        endkey : maxDate.getTime(),
        include_docs : true,
        error : function() {

        },
        success : function(results) {

            var timelineModel = [];
            var calendarModel = [];
            $.each(results.rows, function(i, row) {


                if(app.controller.loadedEvents[row.id]) return;

                var test = app.controller.typeToTimelineModel[row.value];
                var tl  = app.controller.typeToTimelineModel[row.value](row.doc);
                var cal = app.controller.typeToCalendarModel[row.value](row.doc);
                timelineModel.push(tl);
                if (cal) {
                    calendarModel.push(cal);
                }
                app.controller.loadedEvents[row.id] = true;
            });

            callback({
                timelineModel: timelineModel,
                calendarModel : calendarModel
            });
        }
    })
}




app.controller.createTimeline = function(initialDate) {

    if (!initialDate) initialDate = new Date();


    var utcOffset = initialDate.getUTCOffset();

    // hack attack. Not sure what timeline really wants?
    var timeZoneOffset = parseInt(utcOffset[0] + utcOffset[2]);
    var eventSource = new Timeline.DefaultEventSource();
    SimileAjax.History.enabled = false;
    var theme = Timeline.ClassicTheme.create();
    var bandInfos = [
        Timeline.createBandInfo({
            overview:       true,
            layout:         'overview',
            eventSource:    eventSource,
            width:          "20%",
            intervalUnit:   Timeline.DateTime.HOUR,
            intervalPixels: 50,
            theme: theme,
            date : initialDate,
            timeZone: timeZoneOffset
        }),

        Timeline.createBandInfo({
            eventSource:    eventSource,
            width:          "80%",
            intervalUnit:   Timeline.DateTime.MINUTE,
            intervalPixels: 30,
            theme: theme,
            date : initialDate,
            timeZone: timeZoneOffset
        })
    ];
    
    bandInfos[0].highlight = true;
    bandInfos[0].syncWith = 1;


    var earliest = null;
    var latest   = null;

    var tl = Timeline.create(document.getElementById("timeline-ui"), bandInfos);

    var audioProvider = function(date_change_event, callback) {

        // first query
        if (earliest == null && latest == null) {
            earliest = date_change_event.minDate;
            latest   = date_change_event.maxDate;
            app.controller.timelineAudio(date_change_event.minDate, date_change_event.maxDate, date_change_event.centreDate ,callback, false);
        } else if (date_change_event.minDate && date_change_event.minDate.isBefore(earliest)) {
            // we need before
            var endForThisQuery = earliest;
            earliest = date_change_event.minDate;
            app.controller.timelineAudio(earliest, endForThisQuery, date_change_event.centreDate ,callback, false);
         } else if (date_change_event.maxDate && date_change_event.maxDate.isAfter(latest)) {
             var beginOfThisQuery = latest;
             latest = date_change_event.maxDate;
             app.controller.timelineAudio(beginOfThisQuery, latest, date_change_event.centreDate ,callback, false);
         }
    }


    var seen = {};
    // no cache for events
    var eventProvider = function(date_change_event, callback) {
        app.controller.timelineEvents(date_change_event.minDate, date_change_event.maxDate,callback);

    }

    // reset loaded events
    app.controller.loadedEvents = {};

    $('.timelineplayer').timelineaudioplayer({
        timeline: tl,
        initialDate : initialDate,
        calendarDiv : $('#calendar-ui'),
        timelineEventSource : eventSource,
        audioProvider : audioProvider,
        eventProvider : eventProvider
    });
}



app.routes = {
        '/dashboard' : {
            on : function() {
                app.view.activeCategory('dashboard');
                app.view.mainPageChange('dashboard');
            }
        },
        '/timeline' : {
            "/([^/]+)" : {
                on : function(textDate) {
                    var actualDate = app.controller.parseRequestedDate(textDate);
                    app.view.activeCategory('timeline');
                    app.view.mainPageChange('timeline');
                    app.controller.createTimeline(actualDate);
                }
            },
            on : function() {
                app.view.activeCategory('timeline');
                app.view.mainPageChange('timeline');
                //$('.timeline-ui').timeline();
                app.controller.createTimeline();
            }
        },
        '/topics': {
          '/tagged/([^/]+)': {
                on: function(tags) {
                    _tags = app.view.splitTags(tags);
                    app.view.activeCategory('topics');
                    app.view.mainPageChange('topics', {tags:_tags});
                    app.controller.findTopics(_tags, function(results) {
                        app.view.showTopics(results);
                        var tags = app.controller.findDistinctTags(results, _tags);
                        app.view.showDistinctTags(tags);
                    });
                    
                }
          },
          '/located/([^/]+)' : {
              on: function(geohash) {
                app.view.activeCategory('topics');
                app.view.mainPageChange('topics');
                var memo = [];
                var neighborsCount = 0;
                if (geohash.length >= 8) {
                    geohash = geohash.substr(0,8);
                }

                
                app.controller.findClosest(geohash, null, function(rows){
                    memo = memo.concat(rows);
                    neighborsCount++;
                }, function() {
                    var results = {};
                    var now = new Date().getTime();
                    if (neighborsCount > 1) {
                        results.rows = _.sortBy(memo,function(item) {return now - item.doc.timestamp} )
                    } else {
                        results.rows = memo;
                    }
                    
                    app.view.showTopics(results);
                    var tags = app.controller.findDistinctTags(results);
                    app.view.showDistinctTags(tags);
                })

              }
          },
          '/new' : {
                "/([^/]+)" : {
                    on : function(newType) {
                        app.view.activeCategory('topics');
                        app.view.mainPageChange('topicNew', {type : newType});
                        // set the radio
                        

                        $('#' + newType + 'Type').attr('checked', true);
                        
                        var template = newType + 'CreateTemplate';
                        try {
                            $('.topicTypeForm').html( ich[template]()  );
                        } catch(e) {}
                        $('form.newForm .save').click(function() {
        
                            app.controller.save[newType]();
                            return false;
                        });


                    }
                },
                on: function() {
                    app.view.activeCategory('topics');
                    app.view.mainPageChange('topicNew');
                    
                    

                }
          },
          on: function() {
              app.view.activeCategory('topics');
              app.view.mainPageChange('topics');
              app.controller.findTopics(null, function(results) {
                  app.view.showTopics(results);
                  var tags = app.controller.findDistinctTags(results);
                  app.view.showDistinctTags(tags);
              });
          }
        },
        '/threads' : {
            on : function() {app.view.activeCategory('threads')}
        },
        '/meetings' : {
            on : function() {app.view.activeCategory('meetings')}
        }
};


app.view.splitTags = function(tags) {
    if (!tags) return [];
    var _tags = tags.split("+");
    if (_tags == "") return [];

    return _tags;
}



var zeropad = function(num) {
	return ((num < 10) ? '0' : '') + num;
}

var iso8601 = function (date) {
	return date.getUTCFullYear()
	 + "-" + zeropad(date.getUTCMonth()+1)
	 + "-" + zeropad(date.getUTCDate())
	 + "T" + zeropad(date.getUTCHours())
	 + ":" + zeropad(date.getUTCMinutes())
	 + ":" + zeropad(date.getUTCSeconds()) + "Z";
}  