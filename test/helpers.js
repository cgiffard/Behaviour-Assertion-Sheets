var cheerio = require("cheerio"),
	chai = require("chai");
	chai.should();

describe("Helper function",function() {
	
	var helpers = require("../lib/helpers");
	
	describe("cleanRE",function() {
		it("should be able to appropriately extract a regular expression from a string",function() {
			helpers.cleanRE("/[a-z][0-9]{3}*(6)?/ig")
				.should.equal("[a-z][0-9]{3}*(6)?");
				
			helpers.cleanRE("/\\/\\/example.com\\/path\\/path?query=test/ig")
				.should.equal("\\/\\/example.com\\/path\\/path?query=test");
		});
	});
	
	describe("reParams",function() {
		it("should be able to appropriately extract regular expression parameters from a string",function() {
			helpers.reParams("/[a-z][0-9]{3}*(6)?/ig")
				.should.equal("ig");
				
			helpers.reParams("/[a-z][0-9]{3}*(6)?/")
				.should.equal("");
				
			helpers.reParams("/\\/\\/example.com\\/path\\/path?query=test/ig")
				.should.equal("ig");
		});
	});
	
	describe("trim",function() {
		it("should be able to trim whitespace from a string",function() {
			helpers.trim("  	somestring 	\n")
				.should.equal("somestring");
			
			helpers.trim("  	somestring internal		spacing	\n")
				.should.equal("somestring internal		spacing");
		});
	});
	
	describe("getNodePath",function() {
		it("should be able determine the node path, given a node",function() {
			
			var $ = cheerio.load("<html><title>Example title <span class='thingo'>test test test<demo><h1>Stuff</h1></demo></span>to extract</title></html>");
			
			[
				$("html")[0],
				$("title")[0],
				$("span.thingo")[0],
				$("demo h1")[0]
			]
			.forEach(function(node) {
				
				var nodePath = helpers.getNodePath(node);
				
				$(nodePath)[0].should.equal(node);
				
			});
			
		});
	});
});