var chai = require("chai");
	chai.should();

describe("Default bareword",function() {
	
	var barewords = require("../lib/barewords.js");
	
	describe("length",function() {
		it("should return a truthy or falsy value based on the expected result",function() {
			
			barewords.length("abcd",4).should.be.true;
			barewords.length("abcd",5).should.be.false;
			barewords.length("abcd",3).should.be.false;
			
		});
	});
	
	describe("true",function() {
		it("should return a truthy or falsy value based on input truthiness",function() {
			
			barewords.true("abcd").should.be.true;
			barewords.true(1).should.be.true;
			barewords.true(0).should.be.false;
			barewords.true(false).should.be.false;
			
		});
	});
	
	describe("false",function() {
		it("should return a truthy or falsy value based on input truthiness",function() {
			
			barewords.false("abcd").should.be.false;
			barewords.false(1).should.be.false;
			barewords.false(0).should.be.true;
			barewords.false(false).should.be.true;
			
		});
	});
	
	describe("exists (synonym for true)",function() {
		it("should return a truthy or falsy value based on input truthiness",function() {
			
			barewords.exists("abcd").should.be.true;
			barewords.exists(1).should.be.true;
			barewords.exists(0).should.be.false;
			barewords.exists(false).should.be.false;
			
		});
	});
	
	describe("required (synonym for true)",function() {
		it("should return a truthy or falsy value based on input truthiness",function() {
			
			barewords.required("abcd").should.be.true;
			barewords.required(1).should.be.true;
			barewords.required(0).should.be.false;
			barewords.required(false).should.be.false;
			
		});
	});
	
	describe("forbidden (synonym for false)",function() {
		it("should return a truthy or falsy value based on input truthiness",function() {
			
			barewords.forbidden("abcd").should.be.false;
			barewords.forbidden(1).should.be.false;
			barewords.forbidden(0).should.be.true;
			barewords.forbidden(false).should.be.true;
			
		});
	});
	
	describe("gt",function() {
		it("should return true if input is greater than the expectation, false if not",function() {
			
			barewords.gt(10,20).should.be.false;
			barewords.gt(10,10).should.be.false;
			barewords.gt(20,10).should.be.true;
			
		});
	});
	
	describe("gte",function() {
		it("should return true if input is greater than or equal to the expectation, false if not",function() {
			
			barewords.gte(10,20).should.be.false;
			barewords.gte(10,10).should.be.true;
			barewords.gte(20,10).should.be.true;
			
		});
	});
	
	describe("lt",function() {
		it("should return true if input is less than the expectation, false if not",function() {
			
			barewords.lt(10,20).should.be.true;
			barewords.lt(10,10).should.be.false;
			barewords.lt(20,10).should.be.false;
			
		});
	});
	
	describe("lte",function() {
		it("should return true if input is less than or equal to the expectation, false if not",function() {
			
			barewords.lte(10,20).should.be.true;
			barewords.lte(10,10).should.be.true;
			barewords.lte(20,10).should.be.false;
			
		});
	});
	
	describe("ne",function() {
		it("should return true if input is not equal to the expectation, false if it is",function() {
			
			barewords.ne(1,1).should.be.false;
			barewords.ne(1,2).should.be.true;
			barewords.ne(-1.2455,2).should.be.true;
			barewords.ne(-1.2455,-1.2455).should.be.false;
			
		});
	});
	
	describe("longer-than",function() {
		it("should return true if input's string length is longer than the numeric expectation, false if it isn't",function() {
			
			barewords["longer-than"]("a",1).should.be.false;
			barewords["longer-than"]("ab",1).should.be.true;
			barewords["longer-than"]("abc",10.552).should.be.false;
			barewords["longer-than"]("abcdefghijk",10.552).should.be.true;
			
		});
	});
	
	describe("shorter-than",function() {
		it("should return true if input's string length is shorter than the numeric expectation, false if it isn't",function() {
			
			barewords["shorter-than"]("a",2).should.be.true;
			barewords["shorter-than"]("ab",1).should.be.false;
			barewords["shorter-than"]("abc",10.552).should.be.true;
			barewords["shorter-than"]("abcdefghijk",10.552).should.be.false;
			
		});
	});
	
	describe("contains",function() {
		it("should return true if the string input contains an exact match for the string expectation, false if it doesn't",function() {
			
			barewords.contains("a","a").should.be.true;
			barewords.contains("ab","b").should.be.true;
			barewords.contains("abc","abc").should.be.true;
			barewords.contains("abcdefghijk","e").should.be.true;
			barewords.contains("abcdefghijk","l").should.be.false;
			barewords.contains("abcdefghijk","dfe").should.be.false;
			barewords.contains("abc","cba").should.be.false;
			
			barewords.contains("text/html","text/html").should.be.true;
			
		});
	});
	
	describe("one-of",function() {
		it("should return true if the string input contains an exact match for any one of the argumnents, false if it doesn't",function() {
			var oneof = barewords["one-of"];
			
			oneof("abc123","a","abc123").should.be.true;
			oneof("abc123","a","1bc123").should.be.false;
			oneof("fgz","a","1bc123").should.be.false;
			oneof("fgz","a","1bc123","fgz").should.be.true;
			oneof("fgz","a","1bc123","fgx").should.be.false;
			oneof(1,"a","1bc123","fgz",1).should.be.true;
			oneof(1,"a","1bc123","fgz","1").should.be.true;
			oneof(["abc","123"],"a","1bc123",["abc","123"],"1").should.be.true;
			oneof(["abc","123"],"a","1bc123",["abc","231"],"1").should.be.false;
			oneof(true).should.be.false;
			oneof(true,true).should.be.true;
		});
	});
});