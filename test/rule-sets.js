var chai = require("chai");
	chai.should();

describe("Rule Sets",function() {

	var RuleSet = require("../lib/rule-set"),
		Assertion = require("../lib/assertion.js");

	it("should be able to be created",function() {
		
		var rule, error;
		
		// Throw errors when when input does not match expectations
		try {
			rule = new RuleSet();
		} catch(e) {
			error = e;
		}
		
		chai.expect(error).to.be.an.error;
		error = null;
		
		try {
			rule = new RuleSet([]);
		} catch(e) {
			error = e;
		}
		
		chai.expect(error).to.be.an.error;
		error = null;
		
		// Correct instantiation
		rule = new RuleSet(["@page"]);
		rule.kind.should.equal("page");
		
		rule = new RuleSet(["@all"]);
		rule.kind.should.equal("all");
	});
	
	it("should be able to be cast to string",function() {
		var rule = new RuleSet(["@page","(condition = requirement)"]);
		String(rule).should.equal("@page: (condition = requirement)");
		rule = new RuleSet(["@all","(condition = requirement)","(a != b)"]);
		String(rule).should.equal("@all: (condition = requirement) (a != b)");
		
		// When we're not given a kind...
		rule.kind = null;
		String(rule).should.equal("@all: (condition = requirement) (a != b)");
	});
	
	it("should be able to accept assertions",function() {
		var rule = new RuleSet(["@all"]);
		rule.addAssertion({"property":"text","value":"1234"});
		rule.assertions.slice(0).pop().parent.should.equal(rule);
		var assertion = rule.addAssertion({"property":"text","value":"'abc' 2"});
		assertion.should.be.an.instanceOf(Assertion);
	});
	
	it("should be able to accept conditions",function() {
		var rule = new RuleSet(["@page"]);
		
		rule.addCondition("(status-code = 200)");
		rule.conditions.length.should.equal(1);
		rule.conditions.slice(0).pop().should.be.an.instanceof(Function);
		
		// Test the condition which was created
		var condition = rule.conditions.slice(0).pop();
		condition(null,{"status-code":function() { return 200; }})
			.should.equal(true);
		
		condition(null,{"status-code":function() { return 300; }})
			.should.equal(false);
			
		// Test error conditions
		var error;
		try {
			rule.addCondition("(onlyOneComponent)");
		} catch(e) {
			error = e;
		}
		
		chai.expect(error).to.be.an.instanceOf(Error);
		
		error = null;
		try {
			rule.addCondition("(bad @@@ operator)");
		} catch(e) {
			error = e;
		}
		
		chai.expect(error).to.be.an.instanceOf(Error);
		
		error = null;
		try {
			condition(null,{});
		} catch(e) {
			error = e;
		}
		
		chai.expect(error).to.be.an.instanceOf(Error);
	});
	
	it("should be able to accept annotations",function() {
		var rule = new RuleSet(["@page"]),
			annotation;
		
		annotation = rule.addAnnotation("/*@ test annotation */");
		rule.annotations.length.should.equal(1);
		annotation.should.equal("test annotation");
		annotation.should.equal(rule.annotations.pop())
	});
	
	it("should be able to determine set validity",function() {
		var rule = new RuleSet(["@all"]),
			rule2 = new RuleSet(["@page","(status-code = 200)"]);
		
		// All rules are always valid
		rule.validFor().should.equal(true);
		rule.addCondition("(status-code = 'you will never match')");
		rule.validFor().should.equal(true);
		
		// Rules with page are evaluated dependant on conditions
		rule2.validFor(null,{"status-code":function() { return 200; }})
			.should.equal(true);
		
		rule2.validFor(null,{"status-code":function() { return 300; }})
			.should.equal(false);
			
		// Given an unknown kind, validity always fails
		rule2.kind = "imaginary";
		rule2.validFor().should.equal(false);
		rule2.validFor(null,{"status-code":function() { return 200; }})
			.should.equal(false);
	});
});