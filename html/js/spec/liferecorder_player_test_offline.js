



describe("Liferecorder player", function() {
  it("element will get a jplayer, destroy removes", function() {
        $('#example').liferecorder({
            swfPath : 'lib/jPlayer'
        });

        expect($('#example')).toContain('div.player');

        $('#example').liferecorder('destroy');
        expect($('#example')).not.toContain('div.player');

  });

  it("on ready callback will be fired", function() {

        var ready = false;
        $('#example').liferecorder({
            swfPath : 'lib/jPlayer',
            onReady : function() {
                ready = true;
            }
        });
        waitsFor(function() {
            return ready;
        }, "no callback", 3000)

        runs(function() {
            expect($('#example')).toContain('div.player');
            $('#example').liferecorder('destroy');
        });

  });



  /**
   * Since couch queries are one dimension, we need to load audio segments around the
   * requested start. So we need to feed in the max audio segment size.
   *
   *   scenario 1: start is at the beginning of the segment, so end date must be + maxAudioSegmentSize
   *   scenario 2: start is at the end of the segment, so start date must be - audioSegmentSize
   *
   *
   */

  it("on play a date, will load segments based on avg audio duration", function() {
        var now = new Date();
        var maxAudioSegmentSize = 60 * 10 * 1000; // 10 min
        var expectedStart = now.getTime() - maxAudioSegmentSize;
        var expectedEnd   = now.getTime() + maxAudioSegmentSize;

        var actualStart;
        var actualEnd;


        var ready = false;
        $('#example').liferecorder({
            db : 'sasa',
            swfPath : 'lib/jPlayer',
            audioQuery : function(minDate, maxDate, centreDate, callback) {

                actualStart = minDate;
                actualEnd = maxDate;
                callback([]);
                ready = true;
            },
            onReady : function() {
                this.liferecorder('play', now);
            }
        });
        waitsFor(function() {
            return ready;
        }, "no callback", 3000)

        runs(function() {
            expect(actualStart).toBeLessThan(expectedStart);
            expect(actualEnd).toBeGreaterThan(expectedEnd);
            $('#example').liferecorder('destroy');
        });
  });

   it("plays audio!", function() {
        var item = {
            _id: "b739a5e5-1bd3-4211-a12a-4b2a3f0d3e2e",
            type: "recording",
            start: 1139659261000,
            end : 1139659860000,
            file: {
                'R_MIC_110622-115822.mp3': {
                       "content_type": "audio/mpeg",
                       "revpos": 6,
                       "digest": "md5-ApFceNvHKY91UtJWSaxxJw==",
                       "length": 2840513,
                       "stub": true
                   }
            }
        };

        var ready = false;
        var audioStart = new Date(item.start);
        $('#example').liferecorder({
            swfPath : 'lib/jPlayer',
            documentPrefix : '../../api',
            audioQuery : function(minDate, maxDate, centreDate, callback) {
                callback({
                    centerItem : item
                });
                ready = true;
            },
            onReady : function() {
                this.liferecorder('play', audioStart);
            }
        });
        waits(3000);

        runs(function() {
            $('#example').liferecorder('destroy');
        });
   })



   it("plays audio, at an offset", function() {
        var item = {
            _id: "b739a5e5-1bd3-4211-a12a-4b2a3f0d3e2e",
            type: "recording",
            start: 1139659261000,
            end : 1139659860000,
            file: {
                'R_MIC_110622-115822.mp3': {
                       "content_type": "audio/mpeg",
                       "revpos": 6,
                       "digest": "md5-ApFceNvHKY91UtJWSaxxJw==",
                       "length": 2840513,
                       "stub": true
                   }
            }
        };

        var ready = false;
        var audioStart = new Date(item.start + (60 * 1000 * 2) + 20000); //1:40 seconds
        $('#example').liferecorder({
            swfPath : 'lib/jPlayer',
            documentPrefix : '../../api',
            audioQuery : function(minDate, maxDate, centreDate, callback) {
                callback({
                    centerItem : item
                });
                ready = true;
            },
            onReady : function() {
                this.liferecorder('play', audioStart);
            }
        });
        waits(3000);

        runs(function() {
            $('#example').liferecorder('destroy');
        });
   })







   it("when audio ends, it requests and plays the next one", function() {
        var item = {
            _id: "b739a5e5-1bd3-4211-a12a-4b2a3f0d3e2e",
            type: "recording",
            start: 1139659261000,
            end : 1139659616000,
            file: {
                'R_MIC_110622-115822.mp3': {
                       "content_type": "audio/mpeg",
                       "revpos": 6,
                       "digest": "md5-ApFceNvHKY91UtJWSaxxJw==",
                       "length": 2840513,
                       "stub": true
                   }
            }
        };
        var audioStart = new Date(item.end - 1000); //1 seconds from the end

        var audioNextCalled = false;

        $('#example').liferecorder({
            swfPath : 'lib/jPlayer',
            documentPrefix : '../../api',
            audioQuery : function(minDate, maxDate, centreDate, callback) {
                callback({
                    centerItem : item
                });
                ready = true;
            },
            onReady : function() {
                this.liferecorder('play', audioStart); // play for two seconds
            },
            audioNext : function(lastID, lastStartDate, lastEndDate, callback) {
                audioNextCalled = true;
                expect(lastID).toEqual(item._id);
                expect(lastStartDate).toEqual(item.start);
                expect(lastEndDate).toEqual(item.end);

                item.start = item.end  + 1;
                item.end = item.start + 10000;
                callback ({
                    centerItem : item
                });

            }
        });
        waits(3000);

        runs(function() {

            expect(audioNextCalled).toBeTruthy();



            $('#example').liferecorder('destroy');
        });
   })


   it("plays audio, at an offset for a duration", function() {
        var item = {
            _id: "b739a5e5-1bd3-4211-a12a-4b2a3f0d3e2e",
            type: "recording",
            start: 1139659261000,
            end : 1139659616000,
            file: {
                'R_MIC_110622-115822.mp3': {
                       "content_type": "audio/mpeg",
                       "revpos": 6,
                       "digest": "md5-ApFceNvHKY91UtJWSaxxJw==",
                       "length": 2840513,
                       "stub": true
                   }
            }
        };

        var ready = false;
        var stopped = false;

        var audioStart = new Date(item.start + (60 * 1000 * 2) + 20000); //1:40 seconds
        $('#example').liferecorder({
            swfPath : 'lib/jPlayer',
            documentPrefix : '../../api',
            audioQuery : function(minDate, maxDate, centreDate, callback) {
                callback({
                    centerItem : item
                });
                ready = true;
            },
            onReady : function() {
                this.liferecorder('play', audioStart, 2); // play for two seconds
            }
        }).bind('liferecorder.stopped', function() {
            stopped = true;
        });
        waits(3000);

        runs(function() {

            expect(stopped).toBeTruthy();

            $('#example').liferecorder('destroy');
        });
   })

});



