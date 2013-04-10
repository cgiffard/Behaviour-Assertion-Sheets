var chai = require("chai");
	chai.should();
	
describe("General BAS API",function() {
	
	it("should be able to be required",function() {
		var BAS = require("../");
	})
	
	it("should be able to be instantiated",function() {
		var BAS = require("../"),
			testSuite = new BAS();
		
		testSuite.should.be.an("object");
		
		["errors","tests","rules","stats"]
			.forEach(function(name) {
				testSuite.should.have.property(name);
			});
		
	});
	
	it("should be able to load a new sheet",function(done) {
		var BAS = require("../"),
			testSuite = new BAS();
		
		testSuite
			.loadSheet(__dirname + "/sheets/general.bas")
				.yep(function() {
					
					testSuite.rules.length.should.equal(3);
					testSuite.rules.last.should.be.an("object");
					
					done();
				});
	});
	
	it("should enable test registration",function() {
		var BAS = require("../"),
			testSuite = new BAS();
		
		testSuite
			.registerTest("test",function(pageData,params) {
				return true;
			});
		
		testSuite.tests.should.have.property("test");
		testSuite.tests["test"].should.be.a("function");
	});
	
});