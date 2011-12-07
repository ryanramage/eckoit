



describe("Liferecorder player", function() {






  
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


});



