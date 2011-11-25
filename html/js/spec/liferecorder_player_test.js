



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

  
   it("determines the offset for an audio segment", function() {
        var start = new Date();
        var end = new Date(start.getTime() + (60 * 1000 * 10)); // 10 min later
        var requestedDate = new Date(start.getTime() + (60 * 1000 * 5)); // 5 min 

        var expected = requestedDate.getTime() - start.getTime();

        var actual = $.liferecorder.findAudioOffset(start.getTime(), end.getTime(), requestedDate);
        expect(actual).toEqual(expected);
   });

   it("checks for upper bound on the offset for an audio segment", function() {
        var start = new Date();
        var end = new Date(start.getTime() + (60 * 1000 * 10)); // 10 min later
        var requestedDate = new Date(start.getTime() + (60 * 1000 * 11)); // 11 min

        var expected = requestedDate.getTime() - start.getTime();

        expect(function() {
            var actual = $.liferecorder.findAudioOffset(start.getTime(), end.getTime(), requestedDate);
        }).toThrow('startDate is greater than audioEndDate');        
   });

   it("checks for lower bound on the offset for an audio segment", function() {
        var start = new Date();
        var end = new Date(start.getTime() + (60 * 1000 * 10)); // 10 min later
        var requestedDate = new Date(start.getTime() -1 ); // 

        var expected = requestedDate.getTime() - start.getTime();

        expect(function() {
            var actual = $.liferecorder.findAudioOffset(start.getTime(), end.getTime(), requestedDate);
        }).toThrow('startDate is less than audioStartDate');
   });

   it("gets the right attachment for a file", function() {

        var item = {
            _id: "b739a5e5-1bd3-4211-a12a-4b2a3f0d3e2e",
            type: "recording",
            start: 1139659261000,
            file: {
                'R_MIC_060211-050101.mp3': {
                    content_type: "audio/mp3",
                    revpos: 2,
                    digest: "md5-vRhPeQnuO+4ygwAKXD0K0Q==",
                    length: 4800222,
                    stub: true
                }
            },
            end: 1139659860000
        };
        var expected = 'api/b739a5e5-1bd3-4211-a12a-4b2a3f0d3e2e/R_MIC_060211-050101.mp3';

        expect($.liferecorder.urlForAudioView(item)).toEqual(expected);
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
            documentPrefix : '../api',
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
            documentPrefix : '../api',
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




});



