var chai = require("chai"),
	cheerio = require("cheerio");
	chai.should();
	expect = chai.expect;

describe("Assertion Errors",function() {
	var AssertionError = require("../lib/assertion-error"),
		Assertion = require("../lib/assertion");

	it("should permit AssertionErrors to be created",function() {
		var err = new AssertionError();
		
		expect(err.url).to.equal(null);
		expect(err.selector).to.equal(null);
		expect(err.assertion).to.equal(null);
		expect(err.severity).to.equal(0);
		expect(err.annotations).to.be.an("array");
		expect(err.subject).to.equal(null);
		expect(err.component).to.equal(null);
		expect(err.actual).to.equal(null);
		expect(err.node).to.equal(null);
		expect(err.nodePath).to.equal(null);
		expect(err.message).to.be.a("string");
		expect(err.message).to.equal("Unknown Assertion Error");
	});
	
	it("given a valid assertion, permit AssertionErrors to be constructed from it",function() {
		var assertion = new Assertion({
			"property": "thing",
			"value": "lte"
		});
		
		err = new AssertionError(assertion,"lte","not lte");
		
		expect(err.url).to.equal(null);
		expect(err.selector).to.equal(null);
		expect(err.assertion).to.equal(assertion);
		expect(err.severity).to.equal(0);
		expect(err.annotations).to.be.an("array");
		expect(err.subject).to.equal("thing");
		expect(err.component).to.equal("lte");
		expect(err.actual).to.equal("not lte");
		expect(err.node).to.equal(null);
		expect(err.nodePath).to.equal(null);
		expect(err.message).to.be.a("string");
		expect(err.message).to.equal("thing expects 'lte': Component test 'lte' failed against input 'not lte'.");
	});
	
	it("should output an AssertionError message based on the component type",function() {
		
		var components = {
			"'string'":		"String",
			"\"string\"":	"String",
			"60":			"Numeric",
			"/stuff/":		"Regular expression",
			"!/stuff/":		"Negated regular expression",
			"abc":			"Component test",
			"!abc":			"Negated component test",
		}
		
		Object.keys(components).forEach(function(key) {
			var err = new AssertionError(null,key);
			
			if (err.message.indexOf(components[key]) < 0) {
				throw new Error("Expected error of type '" + components[key] + "'");
			}
		});
	});
	
	it("should permit the addition of nodes to AssertionError objects",function() {
		var err = new AssertionError(),
			node = cheerio.load("<node />")("node")[0];
		
		err.addNode.should.be.a("function");
		expect(err.addNode(null)).to.equal(undefined);
		err.addNode(node).should.be.a("string");
		err.addNode(node).should.equal("<node>");
	});
});