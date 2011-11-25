/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


(function( $ ) {



    var methods = {
        init : function(options) {
            return this.each(function() {
                // sort out the options
                if (!options || !options.db) {
                    $.error( 'please provide a db in the options' );
                }

                var settings = {
                    // not sure what I need yet
                    swfPath: "/js/lib/jPlayer",
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
                data = $this.data('liferecorderplayer', {
                    element : $this,
                    settings: settings
                });



                $player = $('<div class="player"></div>');
                $this.append($player);
                $player.jPlayer({
                    swfPath: settings.swPath,
                    ready : function() {
                        settings.onReady.call($this);
                    }
                }).bind($.jPlayer.event.ended, function(event) {
                    
                });


            });
        },

        play : function(startTime, duration) {

            var settings = $(this).data('liferecorderplayer').settings;
            getAudioDocsForDate(startTime, settings, function(results) {
                if (results.centerItem) {
                    // we have found it
                    
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
        findAudioOffset : function(audioStartDate, audioEndDate, startDate ) {
            // assert that the startDate is between the dates.
            if (startDate.getTime() < audioStartDate.getTime()) $.error('startDate is less than audioStartDate');
            if (startDate.getTime() > audioEndDate.getTime())   $.error('startDate is greater than audioEndDate');

            return startDate.getTime() - audioStartDate.getTime();

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



