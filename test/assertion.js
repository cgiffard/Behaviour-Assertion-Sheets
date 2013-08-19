var chai = require("chai"),
	cheerio = require("cheerio");
	chai.should();

describe("Assertions",function() {

	var Assertion = require("../lib/assertion.js"),
		AssertionError = require("../lib/assertion-error.js"),
		tests = require("../lib/tests.js");

	it("should be able to be instantiated",function() {
		var position = {},
		assertion = new Assertion({
			property: "count",
			value: "gte(1)",
			position: position
		});
		
		assertion.annotations.should.be.an("array");
		assertion.annotations.length.should.equal(0);
		assertion.position.should.equal(position);
		expect(assertion.parent).to.equal(null);
		assertion.assertion.should.be.a("function");
		assertion.rawAssertion.should.equal("gte(1)");
		assertion.rawSubject.should.equal("count");
		assertion.transforms.should.be.an("array");
		assertion.transforms.length.should.equal(0);
		assertion.args.should.be.an("array");
		assertion.args.length.should.equal(0);
	});
	
	it("should generate multiple assertion component types",function() {
		var components = {
			"'string'":	"StringMatch",
			"5":		"NumericMatch",
			"/stuff/":	"Regex",
			"!/stuff/":	"NegatedRegex",
			"gte":		"Bareword",
			"!gte":		"NegatedBareword"
		};
		
		var assertion = new Assertion({
			property: "count",
			value: Object.keys(components).join(" ")
		});
		
		assertion.assertion.components.forEach(function(component,index) {
			var intended = components[Object.keys(components)[index]]
			expect(String(component).indexOf(intended)).to.equal(9);
		});
	});
	
	it("should facilitate correct component matches",function() {
		var components = {
			"'string'":	"string",
			"4":		4,
			"/stuff/":	"stuff",
			"!/stuff/":	"things",
			"gte(5)":	10,
			"!gte(20)":	10
		};
		
		var assertion = new Assertion({
			property: "count",
			value: Object.keys(components).join(" ")
		});
		
		assertion.assertion.components.forEach(function(component,index) {
			var input = components[Object.keys(components)[index]];
			
			// Component test will throw if it fails.
			component(input);
		});
	});
	
	it("should reject invalid component matches",function() {
		var components = {
			"'string'":	"nostring",
			"4":		6,
			"/stuff/":	"fish",
			"!/stuff/":	"stuff",
			"gte(5)":	1,
			"!gte(20)":	30
		};
		
		var assertion = new Assertion({
			property: "count",
			value: Object.keys(components).join(" ")
		});
		
		assertion.assertion.components.forEach(function(component,index) {
			var input = components[Object.keys(components)[index]],
				error;
			
			// Component test will throw if it fails.
			try {
				component(input);
			} catch(e) {
				error = e;
			}
			
			return expect(error).to.be.an.instanceof(AssertionError);
		});
	});
	
	it("should reject invalid barewords",function() {
		var error, assertion;
		
		try {
			assertion = new Assertion({
				property: "count",
				value: "invalidbarewordosdifjsoidfjsoid"
			});
		} catch(e) {
			error = e;
		}
		
		expect(error).to.be.an.instanceof(Error);
		
		error = null;
		
		try {
			assertion = new Assertion({
				property: "count",
				value: "!invalidbarewordosdifjsoidfjsoid"
			});
		} catch(e) {
			error = e;
		}
		
		expect(error).to.be.an.instanceof(Error);
	});
	
	it("should reject invalid assertion components",function() {
		var error, assertion;
		
		try {
			assertion = new Assertion({
				property: "count",
				value: "!!!!!!"
			});
		} catch(e) {
			error = e;
		}
		
		expect(error).to.be.an.instanceof(Error);
	});
	
	it("should enable testing",function() {
		var assertion = new Assertion({
			property: "status-code",
			value: "200"
		});
		
		var error;
		
		// Missing documentState object
		try {
			assertion.test();
		} catch(e) {
			error = e;
		}
		
		expect(error).to.be.an.instanceof(Error);
		
		// Missing test map
		try {
			error = null;
			assertion.test({});
		} catch(e) {
			error = e;
		}
		
		expect(error).to.be.an.instanceof(Error);
		
		// Missing test subject
		try {
			error = null;
			assertion.test({},{});
		} catch(e) {
			error = e;
		}
		
		expect(error).to.be.an.instanceof(Error);
		
		// Successful test
		var documentState = {
			res: {
				"statusCode": 200
			}
		};
		
		assertion.test(documentState,tests).should.be.true;
		
		// Failed test
		documentState.res.statusCode = 404;
		assertion.test(documentState,tests).should.be.false;
		
		// Transformations - missing transform
		assertion = new Assertion({
			property: "status-code.missingTransform",
			value: "lte(20)"
		});
		
		try {
			error = null;
			assertion.test(documentState,tests)
		} catch(e) {
			error = e;
		}
		
		expect(error).to.be.an.instanceof(Error);
		
		// Real transformation
		assertion = new Assertion({
			property: "stuff.flesch-kincaid-grade-level",
			value: "lte(20)"
		});
		
		assertion.test(documentState,{
			"stuff": function() {
				return "this is a test this is a test";
			}
		}).should.be.true;
		
		// Failed transformation
		assertion.test(documentState,{
			"stuff": function() {
				return "antidisestablishmentarianism";
			}
		}).should.be.false;
		
	});
	
	it("should export error data correctly",function() {
		// Successful test
		var documentState = {
			res: {
				"statusCode": 200
			},
			url: "http://www.example.com/"
		},
		selector = {},
		node = cheerio.load("<node>")("node")[0];
		
		// Real transformation
		assertion = new Assertion({
			property: "stuff.flesch-kincaid-grade-level",
			value: "lte(20)"
		});
		
		var error = assertion.toError(documentState,{
			"stuff": function() {
				return "antidisestablishmentarianism";
			}
		},node,selector);
		
		var expectedMessage = 
			"stuff.flesch-kincaid-grade-level expects 'lte(20)': " +
			"Component test 'lte' failed against input '55.6'.";
		
		error.forEach(function(error) {
			error.message.should.be.a("string");
			error.message.should.equal(expectedMessage);
			error.should.be.an.instanceOf(AssertionError);
			error.selector.should.equal(selector);
			error.node.should.be.a("string");
			error.node.should.equal("<node>");
		});
		
		// To Error should throw error when not given a test map
		var error = null;
		try {
			var error = assertion.toError(documentState);
		} catch(e) {
			error = e;
		}
		
		expect(error).to.be.an.instanceof(Error);
		
		// To Error should throw error when not given a document state
		var error = null;
		try {
			var error = assertion.toError();
		} catch(e) {
			error = e;
		}
		
		expect(error).to.be.an.instanceof(Error);
	});
	
	it("should permit the addition of annotations",function() {
		// Successful test
		var documentState = {},
			selector = {},
			node = cheerio.load("<node>")("node")[0],
			tests = {
				"stuff": function() {
					return "antidisestablishmentarianism";
				}
			};
		
		// Real transformation
		assertion = new Assertion({
			property: "stuff.flesch-kincaid-grade-level",
			value: "lte(20)"
		});
		// Set up a nasty cyclical system to test the depth condition
		assertion.parent = assertion;
		
		assertion.addAnnotation("Testing, testing, 123!")
		
		var error = assertion.toError(documentState,tests,node,selector)[0];
		
		error.annotations.length.should.equal(5);
		error.annotations.forEach(function(annotation) {
			annotation.should.equal("Testing, testing, 123!");
		});
	});
	
	it("should export key data in describe()",function() {
		assertion = new Assertion({
			property: "stuff(arg1,arg2).flesch-kincaid-grade-level",
			value: "lte(20)"
		});
		
		var description = assertion.describe();
		description[0].should.equal("stuff");
		description[1].toString().should.equal("arg1,arg2");
		description[2].toString().should.equal("flesch-kincaid-grade-level");
		description[3].should.equal("lte(20)");
	});
	
	it("should properly implement toString()",function() {
		assertion = new Assertion({
			property: "stuff(arg1,arg2).flesch-kincaid-grade-level(stuff)",
			value: "lte(20)"
		});
		
		assertion.toString().should
			.equal("stuff(arg1,arg2).flesch-kincaid-grade-level(stuff): lte(20)");
			
		// Assertion with no transforms
		assertion = new Assertion({
			property: "stuff",
			value: "lte(20)"
		});
		
		assertion.toString().should
			.equal("stuff: lte(20)");
		
		// Assertion with no transform arguments
		assertion = new Assertion({
			property: "stuff(arg1,arg2).flesch-kincaid-grade-level",
			value: "lte(20)"
		});
		
		assertion.toString().should
			.equal("stuff(arg1,arg2).flesch-kincaid-grade-level: lte(20)");
	});
});