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
	
	// Exists (synonym for true.)
	
	"exists": function(testResult) {
		return !!testResult;
	},
	
	// Required (synonym for true.)
	
	"required": function(testResult) {
		return !!testResult;
	},
	
	// Forbidden (synonym for false.)
	
	"forbidden": function(testResult) {
		return !testResult;
	},
	
	// Greater than
	
	"gt": function(testResult,expectation) {
		return parseFloat(testResult) > parseFloat(expectation);
	},
	
	// Greater than or equal to
	
	"gte": function(testResult,expectation) {
		return parseFloat(testResult) >= parseFloat(expectation);
	},
	
	// Less than
	
	"lt": function(testResult,expectation) {
		return parseFloat(testResult) < parseFloat(expectation);
	},
	
	// Less than or equal to
	
	"lte": function(testResult,expectation) {
		return parseFloat(testResult) <= parseFloat(expectation);
	},
	
	// Not equal to (numeric comparison)
	
	"ne": function(testResult,expectation) {
		return parseFloat(testResult) !== parseFloat(expectation);
	},
	
	// String is longer than expectation
	
	"longer-than": function(testResult,expectation) {
		return String(testResult).length > parseFloat(expectation);
	},
	
	// String is shorter than expectation
	
	"shorter-than": function(testResult,expectation) {
		return String(testResult).length < parseFloat(expectation);
	}
	
};