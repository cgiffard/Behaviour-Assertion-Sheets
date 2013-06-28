var chai = require("chai");
	chai.should();

describe("Operator",function() {

	var operators = require("../lib/operators.js");

	describe("= (loose equality)",function() {
		it("should return a truthy or falsy value based on the expected result",function() {
			operators["="](1,2).should.be.false;
			operators["="](2,2).should.be.true;
			operators["="]("2",2).should.be.true;
			operators["="]("a","b").should.be.false;
			operators["="]("a","a").should.be.true;
		});
	});
	
	describe("!= (loose inequality)",function() {
		it("should return a truthy or falsy value based on the expected result",function() {
			operators["!="](1,2).should.be.true;
			operators["!="](2,2).should.be.false;
			operators["!="]("2",2).should.be.false;
			operators["!="]("a","b").should.be.true;
			operators["!="]("a","a").should.be.false;
		});
	});
	
	describe("=~ (regex match)",function() {
		it("should return a truthy or falsy value based on the expected result",function() {
			operators["=~"]("a","/a/").should.be.true;
			operators["=~"]("b","/b/").should.be.true;
			operators["=~"]("a","/b/").should.be.false;
			operators["=~"]("a","/[a-z]/").should.be.true;
			operators["=~"]("1","/[a-z]/").should.be.false;
			operators["=~"]("1","/\\d/").should.be.true;
			operators["=~"]("abc1xyz","/\\d/").should.be.true;
			operators["=~"]("abc1xyz","/\\d$/").should.be.false;
			operators["=~"]("abc","/[A-Z]/").should.be.false;
			operators["=~"]("abc","/[A-Z]/i").should.be.true;
		});
	});
	
	describe("!=~ (negated regex match)",function() {
		it("should return a truthy or falsy value based on the expected result",function() {
			operators["!=~"]("a","/a/").should.be.false;
			operators["!=~"]("b","/b/").should.be.false;
			operators["!=~"]("a","/b/").should.be.true;
			operators["!=~"]("a","/[a-z]/").should.be.false;
			operators["!=~"]("1","/[a-z]/").should.be.true;
			operators["!=~"]("1","/\\d/").should.be.false;
			operators["!=~"]("abc1xyz","/\\d/").should.be.false;
			operators["!=~"]("abc1xyz","/\\d$/").should.be.true;
			operators["!=~"]("abc","/[A-Z]/").should.be.true;
			operators["!=~"]("abc","/[A-Z]/i").should.be.false;
		});
	});
	
	describe("> (greater than)",function() {
		it("should return a truthy or falsy value based on the expected result",function() {
			operators[">"](0,0).should.be.false;
			operators[">"](0,1).should.be.false;
			operators[">"](1,0).should.be.true;
			operators[">"](0.002489,1).should.be.false;
			operators[">"](0.002489,0).should.be.true;
			operators[">"](0.002489,0.00031).should.be.true;
			operators[">"]("123","312").should.be.false;
			operators[">"]("321","123").should.be.true;
		});
	});
	
	describe("< (less than)",function() {
		it("should return a truthy or falsy value based on the expected result",function() {
			operators["<"](0,0).should.be.false;
			operators["<"](0,1).should.be.true;
			operators["<"](1,0).should.be.false;
			operators["<"](0.002489,1).should.be.true;
			operators["<"](0.002489,0).should.be.false;
			operators["<"](0.002489,0.00031).should.be.false;
			operators["<"]("123","312").should.be.true;
			operators["<"]("321","123").should.be.false;
		});
	});
	
	describe(">= (greater than or equal to)",function() {
		it("should return a truthy or falsy value based on the expected result",function() {
			operators[">="](0,0).should.be.true;
			operators[">="](5,5).should.be.true;
			operators[">="](12.3444,12.3444).should.be.true;
			operators[">="](0,1).should.be.false;
			operators[">="](1,0).should.be.true;
			operators[">="](0.002489,1).should.be.false;
			operators[">="](0.002489,0).should.be.true;
			operators[">="](0.002489,0.00031).should.be.true;
			operators[">="]("123","312").should.be.false;
			operators[">="]("321","123").should.be.true;
		});
	});
	
	describe("<= (less than or equal to)",function() {
		it("should return a truthy or falsy value based on the expected result",function() {
			operators[">="](0,0).should.be.true;
			operators[">="](5,5).should.be.true;
			operators[">="](12.3444,12.3444).should.be.true;
			operators["<="](0,1).should.be.true;
			operators["<="](1,0).should.be.false;
			operators["<="](0.002489,1).should.be.true;
			operators["<="](0.002489,0).should.be.false;
			operators["<="](0.002489,0.00031).should.be.false;
			operators["<="]("123","312").should.be.true;
			operators["<="]("321","123").should.be.false;
		});
	});
});
