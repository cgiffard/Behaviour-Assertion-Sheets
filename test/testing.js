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
		
		req.defer(url)
			.yep(function(req,data) {
				testSuite.run(url,req,data)
					.yep(function() { done(); });
			});
		
		testSuite
			.loadSheet(__dirname + "/sheets/github.bas")
				.yep(req.last);
		
	});
	
	
});