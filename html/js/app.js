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
        $me.find('.mini-counts').html('<img src="images/spinner.gif" />');
        var id = $me.data('id');

        app.controller.bumpVotes(id, function(newCount) {
            $me.find('.mini-counts').html(newCount);
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



app.parseName = function(name) {
    var divided = name.split(/[\s_]/g);
    var first;
    var last;
    if (_.isArray(divided) && divided.length > 1) {
        first = _.first(divided, divided.length -1).join(' ');
        last = _.last(divided);
    } else {
        first = name;
        last = '';
    }
    return {
        first : first,
        last: last
    }
}

app.savePerson = function(person, success, error) {
    person.type = 'person';
    $.couch.db('').saveDoc(person, {
        success : success,
        error : function(msg) {
            if (error) error(msg);
        }
    });
    
}



app.nameTag = function(nameSplit) {
    return (nameSplit.first + nameSplit.last).toLowerCase();
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


app.controller.findPeople = function(callback, include_docs) {
    if (!include_docs) {
        include_docs = false;
    }
    $.couch.db('').view(app.ddoc + '/people', {
       reduce: false,
       include_docs : include_docs,
       success : callback
    });
}


app.controller.searchPeople = function(query, callback) {
    $.couch.db('').view(app.ddoc + '/people', {
       reduce: false,
       startkey : query,
       endkey : query + '\ufff0',
       include_docs : false,
       success : callback
    });
}



app.controller.getPerson = function(personId, callback) {
   $.couch.db('').openDoc(personId, {
       success : function(doc) {
           callback(doc);
       }
    });
}


app.controller.tombstonePerson = function(personId, callback) {

    app.controller.getPerson(personId, function(doc) {
           doc.tombstone = true;
           app.controller.savePerson(doc, callback);
    });
}


app.controller.savePerson = function(person, callback) {
   $.couch.db('').saveDoc(person, {
       success : function() {
           callback();
       }
   });
}







app.controller.peopleSlugCount = function(callback) {
    $.couch.db('').view(app.ddoc + '/people', {
       reduce: true,
       group_level : 1,
       success : callback
    });
}


app.controller.peopleByImport = function(importName, options, callback) {
    $.couch.db('').view(app.ddoc + '/peopleByImport', {
       reduce: false,
       include_docs : true,
       startkey : [importName],
       endkey : [importName, {}, {}],
       success : callback
    });
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

app.view.showPeople = function(results) {
    var div = $('.main .people');
    div.empty();
    if (!results.rows) return;
    $.each(results.rows, function(i, person) {
        div.append(ich['personTemplate'](person));
    });
}


app.view.typeToTemplate = {
    "com.eckoit.utag" : "timelineRowTemplate",
    "com.eckoit.liferecorder.mark" : "timelineRowTemplate"
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

    var rendered = ich[template](topic) ;
    div.append( rendered );
    if (topic.timestamp) {
  

        rendered.find('.markplayer').each(function(){
            var markplayer = $(this);

            var button = rendered.find('.playbutton');

            var state = 'loading';




            button.bind('click', function() {
                if (state == 'playing') {
                    markplayer.liferecorder('stop');
                    button.html('&#9654;');
                    state = 'stopped';
                }
                else if (state == 'ready' || state == 'stopped') {
                    button.html('&#9632;');
                    markplayer.liferecorder('play', new Date(topic.timestamp), 30);
                    state = 'playing';
                }
            })

            markplayer.liferecorder({
                documentPrefix : 'api',
                audioQuery : app.controller.audioQuery,
                audioNext  : app.controller.audioNext,
                onReady : function() {
                    state = 'ready';
                    button.html('&#9654;');
                }
            }).bind("liferecorder.stopped", function(e, date){
                button.html('&#9654;');
                state = 'stopped';
            });
        });
    }


    
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



app.controller.timelineAudio = function(minDate, maxDate, centreDate, callback) {

    minDate = new Date(minDate);
    maxDate = new Date(maxDate);
    centreDate = new Date(centreDate);

    $.couch.db('').view(app.ddoc + '/audio_by_time', {
        startkey :  minDate.getTime(),
        endkey : maxDate.getTime(),
        error : function() {

        },
        success : function(results) {


            var centerItem;
            var recordings = [];
            $.each(results.rows, function(i, item) {

                if (centreDate && item.value.start <= centreDate.getTime() && centreDate.getTime() <= item.value.end ) {
                    centerItem = item.value;
                }

                var recording =  {
                    eventID: item.id,
                    start: new Date(item.value.start),
                    end: new Date(item.value.end),
                    durationEvent : true,
                    title : "",
                    caption : "Recording",
                    trackNum : 1
                }
                recordings.push(recording);
            });
            callback({
                recordings: recordings,
                centerItem : centerItem
            });
        }
    })
}

app.controller.audioQuery = function(minDate, maxDate, centreDate, callback) {

    minDate = new Date(minDate);
    maxDate = new Date(maxDate);
    centreDate = new Date(centreDate);

    $.couch.db('').view(app.ddoc + '/audio_by_time', {
        startkey :  minDate.getTime(),
        endkey : maxDate.getTime(),
        error : function() {

        },
        success : function(results) {


            var centerItem;
            var recordings = [];
            $.each(results.rows, function(i, item) {
                if (centreDate && item.value.start <= centreDate.getTime() && centreDate.getTime() <= item.value.end ) {
                    centerItem = item.value;
                }

                var recording =  {
                    eventID: item.id,
                    start: new Date(item.value.start),
                    end: new Date(item.value.end),
                    durationEvent : true,
                    title : "",
                    caption : "Recording",
                    trackNum : 1
                }
                recordings.push(recording);
            });
            callback({
                recordings: recordings,
                centerItem : centerItem
            });
        }
    })
}

/**
 * This version of audio next gets the next audio past the start date.
 */
app.controller.audioNext = function(lastID, lastStartDate, lastEndDate, callback) {

    lastStartDate = new Date(lastStartDate);
    lastEndDate = new Date(lastEndDate);

    $.couch.db('').view(app.ddoc + '/audio_by_time', {
        startkey :  lastStartDate.getTime() + 2, // some leeway
        limit : 2,
        error : function() {

        },
        success : function(results) {
            var find = null;
            var closest = Number.MAX_VALUE;

            $.each(results.rows, function(i, item) {
                if (item.id != lastID) {
                    var howClose = item.value.start - lastEndDate.getTime()
                    if (howClose < closest) {
                        find = item.value;
                        closest = howClose;
                    }
                }
            });
            callback({
                centerItem : find
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
            start: new Date(doc.timestamp),
            durationEvent : false,
            //end : new Date(item.value.end),
            title : app.controller.tagToTimelineMarkerTitle(doc),

            caption : "uTag"

        };
        if (doc.duration) {
            base.end = new Date(doc.timestamp + doc.length);
        }

        
        //if(isTagNotEdited(item.value)) {
        //    base.classname = 'untagged';
       // }
        return base;
    },
    "com.eckoit.liferecorder.mark" : function(doc) {

        var base = {
            eventID: doc._id,
            start: new Date(doc.timestamp),
            end :  new Date(doc.timestamp + doc.mark.length),
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
    return true;
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
                //var test = app.controller.typeToTimelineModel[row.value];
                var tl  = app.controller.typeToTimelineModel[row.value](row.doc);
                var cal = app.controller.typeToCalendarModel[row.value](row.doc);
                timelineModel.push(tl);
                if (cal) {
                    calendarModel.push(cal);
                }
            });

            callback({
                timelineModel: timelineModel,
                calendarModel : calendarModel
            });
        }
    })
}


app.controller.dayStatsProvider = function(startDate, endDate, tagCountsCallback, audioCountsCallback) {
    var startkey = [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()];
    var endkey = [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()]

   $.couch.db('').view(app.ddoc + '/mark_totals', {
        startkey :  startkey,
        endkey : endkey,
        reduce : true,
        group_level : 3,
        error : function() {
        },
        success : function(results) {
            var normal = _.map(results.rows, function(row) {
                var date = new Date(row.key[0],row.key[1] -1,row.key[2]);
                return {
                   date : date,
                   count : row.value

                };
            });
            tagCountsCallback(normal);
        }
    });    
   $.couch.db('').view(app.ddoc + '/audio_totals', {
        startkey :  startkey,
        endkey : endkey,
        reduce : true,
        group_level : 3,
        error : function() {
        },
        success : function(results) {
            var normal = _.map(results.rows, function(row) {
                var date = new Date(row.key[0],row.key[1]-1,row.key[2]);
                return {
                   date : date,
                   count : row.value

                };
            });
            audioCountsCallback(normal);
        }
    });
    




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
            width:          "18%",
            intervalUnit:   Timeline.DateTime.HOUR,
            intervalPixels: 40,
            theme: theme,
            date : initialDate,
            timeZone: timeZoneOffset
        }),

        Timeline.createBandInfo({
            eventSource:    eventSource,
            width:          "82%",
            intervalUnit:   Timeline.DateTime.MINUTE,
            intervalPixels: 50,
            theme: theme,
            date : initialDate,
            timeZone: timeZoneOffset
        })
    ];
    
    bandInfos[0].highlight = true;
    bandInfos[0].syncWith = 1;




    var tl = Timeline.create(document.getElementById("timeline-ui"), bandInfos);

    // add a playhead
    var playhead = $('<div id="playhead"></div>');
    $('#timeline-ui').append(playhead);
    var where = $('#timeline-ui').width() / 2;
    playhead.css('margin-left', where + 'px');





    var audioProvider = function(date_change_event, callback) {
        app.controller.timelineAudio(date_change_event.minDate, date_change_event.maxDate, date_change_event.centreDate ,callback, false);
    }


    // no cache for events
    var eventProvider = function(date_change_event, callback) {
        app.controller.timelineEvents(date_change_event.minDate, date_change_event.maxDate,callback);

    }



    // create an audio player




    // reset loaded events
    app.controller.loadedEvents = {};

    $('.timelineplayer').timelineaudioplayer({
        timeline: tl,
        initialDate : initialDate,
        calendarDiv : $('#calendar-ui'),
        audioDiv : $('#audio-ui'),
        statsDiv: $('#stats'),
        timelineEventSource : eventSource,
        audioProvider : audioProvider,
        eventProvider : eventProvider,
        dayStatsProvider : app.controller.dayStatsProvider,
        audioQuery : app.controller.audioQuery,
        audioNext  : app.controller.audioNext
    });
}



app.routes = {
        '/dashboard' : {
            on : function() {
                app.view.activeCategory('dashboard');
                app.view.mainPageChange('dashboard');
                $('textarea').eckoitMentionsInput({
                    app: app
                });
            }
        },
        '/people' : {
            "/([^/]+)" : {
               on : function(nametag) {
                   app.view.activeCategory('people');
                   app.view.mainPageChange('people');
               }
            },
            on : function() {
                app.view.activeCategory('people');
                app.view.mainPageChange('people');
                app.controller.findPeople(function(results){
                   app.view.showPeople(results);
                });
            }
        },
        '/calendar' : {
            "/([^/]+)" : {
                on : function(textDate) {
                    var actualDate = app.controller.parseRequestedDate(textDate);
                    app.view.activeCategory('calendar');
                    app.view.mainPageChange('calendar');
                    app.controller.createTimeline(actualDate);
                }
            },
            on : function() {
                app.view.activeCategory('calendar');
                app.view.mainPageChange('calendar');
                //$('.timeline-ui').timeline();
                app.controller.createTimeline();
            }
        },
        '/timeline': {
          '/tagged/([^/]+)': {
                on: function(tags) {
                    _tags = app.view.splitTags(tags);
                    app.view.activeCategory('timeline');
                    app.view.mainPageChange('timeline', {tags:_tags});
                    app.controller.findTopics(_tags, function(results) {
                        app.view.showTopics(results);
                        var tags = app.controller.findDistinctTags(results, _tags);
                        app.view.showDistinctTags(tags);
                    });
                    
                }
          },
          '/located/([^/]+)' : {
              on: function(geohash) {
                app.view.activeCategory('timeline');
                app.view.mainPageChange('timeline');
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
                        app.view.activeCategory('timeline');
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
              app.view.activeCategory('timeline');
              app.view.mainPageChange('timeline');
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