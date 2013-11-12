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
	
	
	it("should be able to appropriately parse bareword arguments", function(done) {
		
		var BAS = require("../"),
			testSuite = new BAS();
		
		testSuite.loadSheet(__dirname + "/sheets/bareword-arguments.bas")
			.yep(function() {
				testSuite.run(
						"http://example.com/",
						{},
						new Buffer("<h1>Solutions</h1>")
					)
					.yep(function(errors) {
						if (errors && errors.length) {
							return done(new Error(String(errors[0])));
						}
						done();
					})
					.nope(done);
			})
			.nope(done);
	});
});
