// Ruleset definition (@rule)

var RuleList	= require("./rule-list"),
	Assertion	= require("./assertion");

var Ruleset = function(input) {
	//parse rulset input

	if (!input.length || !(input instanceof Array))
		throw new Error("An @rule array is required to make a ruleset.");

	this.input			= input;
	this.annotations	= [];
	this.conditions		= [];
	this.kind			= null;
	this.children		= new RuleList();
	this.assertions		= [];

	if (String(input[0]).match(/^@page/))
		this.kind = "page";

	if (String(input[0]).match(/^@all/))
		this.kind = "all";

	// Add the conditions for this ruleset to run...
	input.slice(1).forEach(this.addCondition.bind(this));
};

Ruleset.prototype.toString = function() {
	return "@" + (this.kind || "all") + ": " + this.input.slice(1).join(" ");
};

Ruleset.prototype.addAssertion = function(input) {
	this.assertions.push(new Assertion(input));
};

Ruleset.prototype.addCondition = function(input) {
	this.conditions.push(this.parseCondition(input));
};

Ruleset.prototype.addAnnotation = function(input) {

	input =
		input
			.replace(/^\/\*\@\s*/i,"")
			.replace(/\s*\*\//i,"")
			.replace(/[\n\r]+/," ");

	this.annotations.push(input);
};

Ruleset.prototype.validFor = function(documentState,tests,verbose) {

	var conditions = this.input.slice(1);

	// 'all' rulesets run on every page.
	if (this.kind === "all") return true;

	// If we've got a page-specific ruleset, we need to check
	// its conditions first
	if (this.kind === "page") {

		var result = 
			this.conditions.reduce(function(prev,cur) {
				return !prev || cur(documentState,tests,verbose);
			},true);

		return result;
	}

	return false;
};

// Returns a function which accepts (a,b) where a is the test function map,
// and b is the data to test
Ruleset.prototype.parseCondition = function(conditionString) {

	var conditionParts =
			conditionString
				.replace(/^\s*\(/,"")
				.replace(/\)\s*$/,"")
				.split(/\s+/,3);

	if (conditionParts.length !== 3)
		throw new Error("Failed to parse condition: three components required.");

	var conditionTest		= conditionParts[0],
		conditionOperator	= conditionParts[1],
		conditionBenchmark	= conditionParts[2];

	var operators = require("./operators");

	if (!operators[conditionOperator])
		throw new Error("Unsupported operator: " + conditionOperator);

	return function(documentState,tests,verbose) {

		if (!tests[conditionTest])
			throw new Error("Unknown or unregistered test: " + conditionTest);

		var testResult = tests[conditionTest](documentState);

		var comparisonResult =
				operators[conditionOperator]
					(testResult,conditionBenchmark);

		return comparisonResult;
	}
};

module.exports = Ruleset;