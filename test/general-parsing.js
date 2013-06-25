var chai = require("chai");
	chai.should();

describe("General Document Parser",function() {

	it("should be able to read complex regular expressions", function(done) {
		
		var BAS = require("../"),
			testSuite = new BAS();
		
		testSuite.loadSheet(__dirname + "/sheets/regex.bas")
			.yep(function() {
				done();
			})
			.nope(done);
	});
});
