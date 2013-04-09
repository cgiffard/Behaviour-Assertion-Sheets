var chai = require("chai");
	chai.should();
	
describe("General BAS API",function() {
	
	it("should be able to be required",function() {
		var BAS = require("../");
	})
	
	it("should be able to be instantiated",function() {
		var BAS = require("../"),
			testSuite = new BAS();
	});
	
	it("should be able to load a new sheet",function(done) {
		var BAS = require("../"),
			testSuite = new BAS();
		
		testSuite
			.loadSheet(__dirname + "/sheets/general.bas")
				.yep(done);
	});
	
})