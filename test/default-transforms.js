var chai = require("chai");
	chai.should();

describe("Default transform function",function() {
	
	var transforms = require("../lib/transforms");
	
	// Nonsensical, but it'll do the trick.
	var testInputText = "The quick brown fox jumped over the lazy dog. Some aspects of the dog are generally equivalent to the reciprocal input that originates from politically destabilised geographic regions.";
	
	describe("flesch-kincaid-reading-ease",function() {
		it("should appropriately calculate the readability score of the input",function() {
			
			transforms["flesch-kincaid-reading-ease"]({},testInputText)
				.should.equal(43.4);
		});
	});
	
	describe("flesch-kincaid-grade-level",function() {
		it("should appropriately calculate the readability score of the input",function() {
			
			transforms["flesch-kincaid-grade-level"]({},testInputText)
				.should.equal(8.6);
		});
	});
	
	describe("gunning-fog-score",function() {
		it("should appropriately calculate the readability score of the input",function() {
			transforms["gunning-fog-score"]({},testInputText)
				.should.equal(12);
		});
	});
	
	describe("coleman-liau-index",function() {
		it("should appropriately calculate the readability score of the input",function() {
			transforms["coleman-liau-index"]({},testInputText)
				.should.equal(15.6);
		});
	});
	
	describe("smog-index",function() {
		it("should appropriately calculate the readability score of the input",function() {
			transforms["smog-index"]({},testInputText)
				.should.equal(7.8);
		});
	});
	
	describe("automated-readability-index",function() {
		it("should appropriately calculate the readability score of the input",function() {
			transforms["automated-readability-index"]({},testInputText)
				.should.equal(7.4);
		});
	});
	
	describe("letter-count",function() {
		it("should count the number of letters in the input",function() {
			transforms["letter-count"]({},testInputText)
				.should.equal(155);
		});
	});
	
	describe("sentence-count",function() {
		it("should count the number of sentences in the input",function() {
			transforms["sentence-count"]({},testInputText)
				.should.equal(3);
		});
	});
	
	describe("word-count",function() {
		it("should count the number of words in the input",function() {
			transforms["word-count"]({},testInputText)
				.should.equal(29);
		});
	});
	
	describe("average-words-per-sentence",function() {
		it("should count the average number of words in each sentence from the input",function() {
			transforms["average-words-per-sentence"]({},testInputText)
				.should.equal(7.25);
		});
	});
	
	describe("average-syllables-per-word",function() {
		it("should count the average number syllables in each word in the input",function() {
			Math.round(transforms["average-syllables-per-word"]({},testInputText)*100)
				.should.equal(186);
		});
	});
	
	describe("length",function() {
		it("should return the 'length' property of the input",function() {
			transforms.length({},{"length":12345})
				.should.equal(12345);
				
			transforms.length({},null)
				.should.equal(0);
		})
	});
	
	describe("type",function() {
		it("should return the JS type of the input",function() {
				
			transforms.type({},51)
				.should.equal("number");
			
			transforms.type({},"test")
				.should.equal("string");
			
			transforms.type({},{})
				.should.equal("object");
		})
	});
	
});