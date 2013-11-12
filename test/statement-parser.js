var chai = require("chai");
	chai.should();

describe("Statement Parser",function() {

	var parser = require("../lib/statement-parser.js");

	it("should be able to parse numeric values",function() {
		parser("9").should.be.an.array;
		parser("9").length.should.equal(1);
		parser("400").should.be.an.array;
		parser("400").length.should.equal(1);
		parser("6.235235").should.be.an.array;
		parser("6.235235").length.should.equal(1);
		
		parser("5 23.23 77.23, 990").should.be.an.array;
		parser("5 23.23 77.23, 990").length.should.equal(4);
		parser("5 23.23 77.23, 990")[0].should.equal("5");
		parser("5 23.23 77.23, 990")[1].should.equal("23.23");
		parser("5 23.23 77.23, 990")[2].should.equal("77.23");
		parser("5 23.23 77.23, 990")[3].should.equal("990");
	});
	
	it("should be able to parse string values",function() {
		parser("a b c d").length.should.equal(4);
		parser("a b c djk3849sd_sdf").length.should.equal(4);
		parser("a djk384/9sd_sdf c djk3849sd_sdf").length.should.equal(4);
		parser("a djk384/9sd_sdf c djk3849sd_sdf")[1].should.equal("djk384/9sd_sdf");
	});
	
	it("should be able to parse regular expression values",function() {
		parser("/a b c d/ig").length.should.equal(1);
		parser("/a b c d/ig")[0].should.equal("/a b c d/ig");
		
		parser("/a b c d/ig, /[a-z]([0-9])/").length.should.equal(2);
		parser("/a b c d/ig, /[a-z]([0-9])/")[1].should.equal("/[a-z]([0-9])/");
		parser("/a b c d/ig, /[a-z]([0-9])/")[0].should.equal("/a b c d/ig");
		
		parser("/a b c d/ig /[a-z]([0-9])/").length.should.equal(2);
		parser("/a b c d/ig /[a-z]([0-9])/")[1].should.equal("/[a-z]([0-9])/");
	});
	
	it("should be able to parse complex regular expression values",function() {
		parser("/^[\\d\\:]+$/, longer-than(0)").length.should.equal(2);
		parser("/^[\\d\\:]+$/, longer-than(0)")[0].should.equal("/^[\\d\\:]+$/");
		
		parser("required, /^video\\/(mp4|webm)$/").length.should.equal(2);
		parser("required, /^video\\/(mp4|webm)$/")[1].should.equal("/^video\\/(mp4|webm)$/");
	});
	
	it("should be able to parse negated regular expression values",function() {
		parser("!/a b c d/ig").length.should.equal(1);
		parser("!/a b c d/ig")[0].should.equal("!/a b c d/ig");
		
		parser("!/a b c d/ig, !/[a-z]([0-9])/").length.should.equal(2);
		parser("!/a b c d/ig, !/[a-z]([0-9])/")[1].should.equal("!/[a-z]([0-9])/");
		parser("!/a b c d/ig, !/[a-z]([0-9])/")[0].should.equal("!/a b c d/ig");
		
		parser("/a b c d/ig !/[a-z]([0-9])/").length.should.equal(2);
		parser("/a b c d/ig !/[a-z]([0-9])/")[1].should.equal("!/[a-z]([0-9])/");
	});
	
	it("should be able to parse bareword values",function() {
		parser("bare-word").length.should.equal(1);
		parser("bare-word")[0].should.equal("bare-word");
		
		parser("bare-word()").length.should.equal(1);
		parser("bare-word()")[0].should.equal("bare-word()");
		
		parser("bare-word() bare-word2()").length.should.equal(2);
		parser("bare-word(), bare-word2()")[1].should.equal("bare-word2()");
	});
	
	it("should be able to parse negated bareword values",function() {
		parser("!bare-word").length.should.equal(1);
		parser("!bare-word")[0].should.equal("!bare-word");
		
		parser("!bare-word()").length.should.equal(1);
		parser("!bare-word()")[0].should.equal("!bare-word()");
		
		parser("!bare-word() !bare-word2()").length.should.equal(2);
		parser("!bare-word(), !bare-word2()")[1].should.equal("!bare-word2()");
	});
	
	it("should be able to parse bareword arguments",function() {
		parser("bare-word(abc,abc,abc)").length.should.equal(1);
		parser("bare-word(abc,abc,abc)")[0].should.equal("bare-word(abc,abc,abc)");
		
		parser("bare-word(abc,abc,abc), bareword2(/regexarg/)").length.should.equal(2);
		parser("bare-word(abc,abc,abc), bareword2(/regexarg/)")[1].should.equal("bareword2(/regexarg/)");
	});
	
	it("should be able to parse nested barewords",function() {
		parser("bare-word(bareword2(bareword3)))").length.should.equal(1);
		parser("bare-word(bareword2(bareword3)))")[0].should.equal("bare-word(bareword2(bareword3)))");
	});
	
	it("should be able to handle escape sequences",function() {
		parser("bare-word(bareword2\\) bareword3)").length.should.equal(1);
		parser("bare-word(bareword2\\) bareword3)")[0].should.equal("bare-word(bareword2) bareword3)");
		
		parser("bare-word(bareword2\\\\) bareword3)").length.should.equal(2);
		parser("bare-word(bareword2\\\\) bareword3)")[0].should.equal("bare-word(bareword2\\)");
	});
	
	it("should be able to handle combined component types",function() {
		var combinedText = "400 gte(400) bareword(otherbareword()) !/stuff/";
		parser(combinedText).length.should.equal(4);
		parser(combinedText)[0].should.equal("400");
		parser(combinedText)[1].should.equal("gte(400)");
		parser(combinedText)[2].should.equal("bareword(otherbareword())");
		parser(combinedText)[3].should.equal("!/stuff/");
	});
	
	it("should be able to handle an orphaned escape",function() {
		var combinedText = "\\";
		parser(combinedText).length.should.equal(1);
		parser(combinedText)[0].should.equal("\\");
	});
	
	it("should be able to handle unmatched delimiters",function() {
		var combinedText = "a'ngus";
		parser(combinedText).length.should.equal(1);
		parser(combinedText)[0].should.equal("a'ngus");
	});
	
	it("should be able to handle an empty parse buffer",function() {
		var combinedText = "";
		parser(combinedText).length.should.equal(0);
	});
	
	it("should throw out junk input",function() {
		chai.expect(parser(null)).to.equal(undefined);
	});
	
	it("should throw out junk input",function() {
		chai.expect(parser(null)).to.equal(undefined);
	});
	
	it("should be able to parse bareword arguments",function() {
		var args = parser.parseArguments("brain(stuffo, face)")
		args.length.should.equal(2);
		args[0].should.equal("brain");
		String(args[1]).should.equal("stuffo,face");
	});
	
	describe("Utility function trim",function() {
		it("should be able to trim quotes from arguments",function() {
			var components = ["'test'","\"test\"","'test a b c'","\"test a b c\""],
				expectation = ["test","test","test a b c","test a b c"],
				trimmed = parser.trim(components);
			
			trimmed.forEach(function(arg,index) {
				arg.should.equal(expectation[index]);
			});
		});
		
		it("should not trim quotes from unbalanced arguments",function() {
			var components = ["'test","\"test","test'","test\""],
				trimmed = parser.trim(components);
			
			components.forEach(function(arg,index) {
				arg.should.equal(trimmed[index]);
			});
		});
	})
});