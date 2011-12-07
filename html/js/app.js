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


app.controller.createTimeline = function(initialDate) {

    if (!initialDate) initialDate = new Date();

    var utcOffset = initialDate.getUTCOffset();

    // hack attack. Not sure what timeline really wants?
    var timeZoneOffset = parseInt(utcOffset[0] + utcOffset[2]);
    var eventSource = new Timeline.DefaultEventSource();
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

    var tl = Timeline.create(document.getElementById("timeline-ui"), bandInfos);




    $('.timelineplayer').timelineaudioplayer({
        timeline: tl,
        initialDate : initialDate,
        calendarDiv : $('.calendar-ui')
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