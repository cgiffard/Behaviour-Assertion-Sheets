// 'Bareword' functions for assertion syntax.

module.exports = {
	
	// Tests whether the length of a test result matches expectations
	
	"length": function(testResult,expectedLength) {
		
		// Ensure we're dealing with a number
		expectedLength = parseInt(expectedLength,10);
		
		return testResult.length === expectedLength;
		
	},
	
	// Tests whether a test result is truthy
	
	"true": function(testResult) {
		return !!testResult;
	},
	
	// Tests whether a test result is falsy
	
	"false": function(testResult) {
		return !testResult;
	},
	
};