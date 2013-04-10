var chai = require("chai");
	chai.should();

var yoyaku = require("yoyaku"),
	request = require("request"),
	req	= yoyaku.yepnope(request);
	
var url = "https://github.com/";

describe("Test runner",function() {
	
	it("should be able to be called",function(done) {
		
		var BAS = require("../"),
			testSuite = new BAS();
		
		// With Yoyaku
		
		req.defer(url)
			.yep(testSuite.run.curry(3,url)
					.yep(done));
		
		testSuite
			.loadSheet(__dirname + "/sheets/github.bas")
				.yep(req.last);
		
	});
	
	
});