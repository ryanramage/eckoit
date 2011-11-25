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
                        callback([]);
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
                    errorAlerts : true
                }).bind($.jPlayer.event.ended, function(event) {
                    
                });


                data = $this.data('liferecorderplayer', {
                    element : $this,
                    player  : $player,
                    settings: settings
                });

            });
        },

        play : function(startTime, duration) {
            var data = $(this).data('liferecorderplayer');
            var settings = data.settings;
            getAudioDocsForDate(startTime, settings, function(results) {
                if (results.centerItem) {
                    // we have found it
                    var offsetSeconds = $.liferecorder.findAudioOffset(results.centerItem.start, results.centerItem.end, startTime) / 1000;
                    var mediaUrl = $.liferecorder.urlForAudioView(results.centerItem, settings.documentPrefix);
                    console.log('playing ' + mediaUrl + " at " + offsetSeconds + " seconds" );
                    data.player.jPlayer("setMedia", {
                        mp3: mediaUrl
                    }).jPlayer("play", offsetSeconds);
                }
            })



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

            return startDate.getTime() - audioStartTime;
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



