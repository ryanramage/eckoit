/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


(function( $ ) {



    var methods = {
        init : function(options) {
            return this.each(function() {


                var settings = {
                    // not sure what I need yet
                    swfPath: "/js/lib/jPlayer",
                    documentPrefix : "api",
                    audioQuery : function(minDate, maxDate, centreDate, callback) {
                        callback({});
                    },
                    audioNext : function(lastID, lastStartDate, lastEndDate, callback) {
                       callback({});
                    },
                    onReady : function() {

                    },
                    maxAudioSegmentSize: 60 * 10 * 1000 // 10 min
                }

                $.extend( settings, options );

                // get the element
                var $this = $(this);
                $this.addClass('liferecorderplayer');





                $player = $('<div class="player"></div>');
                $this.append($player);
                $player.jPlayer({
                    swfPath: settings.swPath,
                    ready : function() {
                        settings.onReady.call($this);
                    },
                    supplied : "mp3",
                    preload:"auto"
                }).bind($.jPlayer.event.ended, function(event) {

                    console.log('Audio ended');

                    // we need to get the next
                    var data = $this.data('liferecorderplayer');
                    
                    data.settings.audioNext(data.lastID, data.lastStartDate, data.lastEndDate, function(results) {
                        console.log(results);
                        if (results.centerItem) {
                            // we have found it

                            
                            data.lastID = results.centerItem._id;
                            data.lastStartDate = results.centerItem.start;
                            data.lastEndDate = results.centerItem.end;

                            var offsetSeconds = $.liferecorder.findAudioOffset(results.centerItem.start, results.centerItem.end, new Date(results.centerItem.start)) / 1000;
                            var mediaUrl = $.liferecorder.urlForAudioView(results.centerItem, settings.documentPrefix);


                            console.log('audio start date: ' + new Date(results.centerItem.start).toString());
                            console.log('playing at offset: ' + offsetSeconds);

                            var playingDate = new Date(results.centerItem.start + (offsetSeconds * 1000));
                            console.log('offset "Date": ' + playingDate.toString());
                            console.log('audio ends at: ' + new Date(results.centerItem.end));

                            data.player.jPlayer("setMedia", {
                                mp3: mediaUrl
                            }).jPlayer("play", offsetSeconds);
                            $this.trigger('liferecorder.update', results.centerItem.start);
                        }
                    });


                }).bind($.jPlayer.event.timeupdate, function(event) {

                    var data = $this.data('liferecorderplayer');
                    var playingDate = new Date( data.lastStartDate +  ( event.jPlayer.status.currentTime * 1000));
                    console.log('inside job: ' + event.jPlayer.status.currentTime);
                    console.log('inside job: ' + playingDate.toString());
                    console.log('inside job time: ' + playingDate.getTime());
                    if (data.endTime && (data.endTime.getTime() < playingDate.getTime())) {
                        console.log('inside end');
                        // if we are past, end the audio
                        data.player.jPlayer("stop");
                        $this.trigger('liferecorder.stopped', playingDate);
                    } else {
                        $this.trigger('liferecorder.update', playingDate);
                    }                    
                }).bind($.jPlayer.event.seeking, function(event) {
                    console.log('seek');
                }).bind($.jPlayer.event.play, function(event) { // Add a listener to report the time play began
                  console.log("Play began at time = " + event.jPlayer.status.currentTime);
                }).bind($.jPlayer.event.ended + ".jp-repeat", function(event) { // Using ".jp-repeat" namespace so we can easily remove this event
                    console.log('ended');
                }).bind($.jPlayer.event.warning, function(event){
                    console.log('warning!', event);
                })


                data = $this.data('liferecorderplayer', {
                    element : $this,
                    player  : $player,
                    settings: settings
                });

            });
        },

        play : function(startTime, durationSeconds) {
            var data = $(this).data('liferecorderplayer');
            data.startTime = startTime;
            if (durationSeconds) {
                data.endTime = new Date(startTime.getTime() + (durationSeconds * 1000));
            } else {
                data.endTime = null;
            }

            data.player.jPlayer("stop");

            console.log('liferecorder start: ' + data.startTime.toString());
            var settings = data.settings;
            getAudioDocsForDate(startTime, settings, function(results) {

                if (results.centerItem) {
                    // we have found it
                    data.lastID = results.centerItem._id;
                    data.lastStartDate = results.centerItem.start;
                    data.lastEndDate = results.centerItem.end;


                    console.log('audio start date: ' + new Date(results.centerItem.start).toString());
                    console.log('audio start mill: ' + results.centerItem.start);

                    var offsetSeconds = $.liferecorder.findAudioOffset(results.centerItem.start, results.centerItem.end, startTime) / 1000;

                    console.log('playing at offset: ' + offsetSeconds);

                    var playingDate = new Date(results.centerItem.start + (offsetSeconds * 1000));
                    console.log('offset "Date": ' + playingDate.toString());

                    console.log('audio ends at: ' + new Date(results.centerItem.end));
                    var mediaUrl = $.liferecorder.urlForAudioView(results.centerItem, settings.documentPrefix);

                    data.player.jPlayer("setMedia", {
                        mp3: mediaUrl
                    }).jPlayer("play", offsetSeconds);
                }
            })



        },
        stop : function() {
            var data = $(this).data('liferecorderplayer');
            data.player.jPlayer("stop");
        },
        destroy : function() {
            var player = $(this).data('liferecorderplayer').element.find('.player');
            player.jPlayer("destroy");
            player.remove();
        }
    }



    // helper functions
    function getAudioDocsForDate(date, settings, callback) {
        

        var bufferStart = date.getTime() - (settings.maxAudioSegmentSize + 1000);
        var bufferEnd   = date.getTime() + (settings.maxAudioSegmentSize + 1000);
        settings.audioQuery(bufferStart, bufferEnd, date, function(results){
            callback(results);
        });
    }


    // The static methods
    $.liferecorder = {
        findAudioOffset : function(audioStartTime, audioEndTime, startDate ) {
            // assert that the startDate is between the dates.
            if (startDate.getTime() < audioStartTime) $.error('startDate is less than audioStartDate');
            if (startDate.getTime() > audioEndTime)   $.error('startDate is greater than audioEndDate');

            return Math.round(startDate.getTime() - audioStartTime);
        },
        urlForAudioView : function(item, prefix) {
            if (!prefix) prefix = 'api';

            var mediaName;
            for (i in item.file) {
                mediaName = i;
                break;
            }
            item.file[0]
            return prefix + '/' + item._id + '/' + mediaName ;
        }


    }


    // bind to the jQuery object, dispatch names to methods
    $.fn.liferecorder = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.liferecorder');
        }
    }


}(jQuery));



