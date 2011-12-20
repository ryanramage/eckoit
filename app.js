
var couchapp = require('couchapp')
    , path = require('path');

  ddoc = {
      _id: '_design/app2'
    , views: {}
    , lists: {}
    , shows: {}
    , updates: {}
  }

  module.exports = ddoc;



  ddoc.language = "javascript";
  ddoc.rewrites = [
      {from:"/", to:'index.html'}
    , {from:"/api", to:'../../'}
    , {from:"/api/*", to:'../../*'}
    , {from:"/*", to:'*'}
    ];

/** add views/shows/lists below **/

  ddoc.views.people = {
      map : function(doc) {
          if (doc.type && doc.type == 'person' && !doc.tombstone) {
              var result = {
                  pic : doc.picture,
                  name : doc.fullName
              }
              if (doc._attachments) {
                  result.pic = doc._attachments;
              }
              if (!result.pic || result.pic == '') {
                  result.pic = 'http://placehold.it/90x90';
              }

              emit(doc.slug, result);
              
              
          }
      },
      reduce: '_count'
  }


  ddoc.views.peopleByImport = {
      map : function(doc) {
          if (doc.type && doc.type == 'person' && doc.importInfo) {
              emit([doc.importInfo.source, doc.importInfo.source_id], null);
          }
      }
  }





  ddoc.views.audio_by_time = {
     map: function(doc) {
         if (doc.recording) {
             var result = {
                 _id: doc._id,
                 type: 'recording',
                 start : doc.recording.start,
                 file : doc._attachments
             };
             if (doc.recording.length) {
                 result.end = (doc.recording.length * 1000) + doc.recording.start;
             }
             emit(result.start, result);
         }
     }
  }


  ddoc.views.timeline_stuff = {
      map: function(doc) {
          if (doc.timestamp) {
              emit(doc.timestamp, doc.type)
          }
      }
  }


  ddoc.views.mark_totals = {
      map : function(doc) {
          if (doc.timestamp) {
             var start  = doc.timestamp;
             var d = new Date(start);
             var year = d.getFullYear();
             var month = d.getMonth() + 1;
             var day = d.getDate() ;
             emit([year, month, day], 1);
          }
      },
      reduce: '_sum'
  }

  ddoc.views.audio_totals = {
      map : function(doc) {
          if (doc.recording) {
             var start  = doc.recording.start;
             var length = doc.recording.length;
             if (length == 0) return;
             var d = new Date(start);
             var year = d.getFullYear();
             var month = d.getMonth() + 1;
             if (month <= 9) month = '0' + month;
             var day = d.getDate() ;
             if (day <=9) day = '0' + day;
             emit([year, month, day], length);
          }
      },
      reduce: '_sum'
  }



  ddoc.views.unfiltered = {
      map : function(doc) {
          if (doc.timestamp)                            emit([0, doc.timestamp], null);
          if (doc.votes)                                emit([1, doc.votes],     null);
          if (doc.views)                                emit([2, doc.views],     null);

          if (doc.discussed) {
            if (doc.discussed == 0 && doc.timestamp)    emit([3, doc.timestamp], null);
            else if (doc.discussed == 0)                emit([3, null],          null);
          }
          if (doc.resolved) {
              if (doc.resolved == false && doc.timestamp) emit([4, doc.timestamp], null);
              else if (doc.resolved == false)             emit([4, null],          null);
          }
      },
      reduce: '_count'
  }





  ddoc.views.byTag = {
      map : function(doc) {
          var preemit = function(tag, tags) {
              if (doc.timestamp)                            emit([tag, 0, doc.timestamp], tags);
              if (doc.votes)                                emit([tag, 1, doc.votes],     tags);
              if (doc.views)                                emit([tag, 2, doc.views],     tags);

              if (doc.discussed) {
                if (doc.discussed == 0 && doc.timestamp)    emit([tag, 3, doc.timestamp], tags);
                else if (doc.discussed == 0)                emit([tag, 3, null],          tags);
              }
              if (doc.resolved) {
                  if (doc.resolved == false && doc.timestamp) emit([tag, 4, doc.timestamp], tags);
                  else if (doc.resolved == false)             emit([tag, 4, null],          tags);
              }
          };
          if (doc.tags) {
              for (var i in doc.tags) {
                  preemit(doc.tags[i], doc.tags);
              }
          } else {
              preemit('/', null);
          }
      },
      reduce : '_count'
  }

  ddoc.views.byGeohash = {
      map : function(doc) {
          if (doc.position && doc.position.geohash) {
              emit(doc.position.geohash, null);
          }
      }
  }

  ddoc.views.byGeohashExact = {
     map : function(doc) {
          if (doc.position && doc.position.geohash) {
              for (var i=5; i < 9; i++) {
                 var geohash = doc.position.geohash.substr(0,i);
                 emit([geohash, doc.timestamp], null);
              }
          }
      },
      reduce: '_count'
  }



  ddoc.lists.intersection = function (head, req) {
      var row;
      var extraKeys = [];
      if (req.query.key) {
          extraKeys.push(req.query.key);
      }
      if (req.query.extra_keys) {
          extraKeys = extraKeys.concat(JSON.parse(req.query.extra_keys));
      }

      start({'headers' : {'Content-Type' : 'application/json'}});
      send('{ "rows" : [\n');
      var count = 0;
      while ((row = getRow())) {
          var hasAll = true;
          var docTags = row.value;
          if (docTags) {

            for (var i in extraKeys) {
                var hasOne = false;
                for (var j in row.value) {
                    if (row.value[j] == extraKeys[i]) {
                        hasOne = true; break;
                    }
                }
                if (!hasOne) {
                    hasAll = false; break;
                }
            }
          }
          if (hasAll) {
              if (count++ > 0) {
                  send (',\n');
              }
              send(JSON.stringify(row));
          }
      }
      send('\n]}');
  }



  ddoc.updates.bumpVotes = function(doc, req) {
      if (!doc) {
          return [null, "Need an existing doc"];
      } else {
          if (!doc.votes) doc.votes = 1;
          else doc.votes++;
          return [doc, doc.votes + ""];
      }
  }
  ddoc.updates.bumpViews = function(doc, req) {
      if (!doc) {
          return [null, "Need an existing doc"];
      } else {
          if (!doc.views) doc.views = 1;
          else doc.views++;
          return [doc, doc.views + ""];
      }
  }






  couchapp.loadAttachments(ddoc, path.join(__dirname, 'html'));