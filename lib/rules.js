// Rule container classes

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

Ruleset.prototype.validFor = function(documentState,tests) {
	
	var conditions = this.input.slice(1);
	
	// 'all' rulesets run on every page.
	if (this.kind === "all") return true;
	
	// If we've got a page-specific ruleset, we need to check
	// its conditions first
	if (this.kind === "page") {
		
		var result = 
			this.conditions.reduce(function(prev,cur) {
				return !prev || cur(documentState,tests);
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
	
	// Clean up a string regular expression
	function cleanRE(re) {
		return re
			.replace(/^\//,"")
			.replace(/\/[a-z]*$/,"");
	}
	
	// Get params from a string regular expression
	function reParams(re) {
		var match = re.match(/\/([a-z]*)$/i);
		return match && match[1] ? match[1] : "";
	}
	
	var operators = {
		"=": function(a,b) {
			// Strict equality instead? Not sure.
			return a == b;
		},
		
		"!=": function(a,b) {
			return a != b;
		},

		"=~": function(a,b) {
			return !!(new RegExp(cleanRE(b),reParams(b))).exec(a);
		},
		
		"!=~": function(a,b) {
			return !(new RegExp(cleanRE(b),reParams(b))).exec(a);
		},
		
		">": function(a,b) {
			return parseFloat(a) > parseFloat(b);
		},
		
		"<": function(a,b) {
			return parseFloat(a) < parseFloat(b);
		},
		
		">=": function(a,b) {
			return parseFloat(a) >= parseFloat(b);
		},
		
		"<=": function(a,b) {
			return parseFloat(a) <= parseFloat(b);
		}
	};
	
	if (!operators[conditionOperator])
		throw new Error("Unsupported operator: " + conditionOperator);
	
	return function(documentState,tests) {
		
		if (!tests[conditionTest])
			throw new Error("Unknown or unregistered test: " + conditionTest);
		
		return (
			operators[conditionOperator]
				(
					tests[conditionTest](documentState),
					conditionBenchmark
					));
	}
};




var RuleList = function() {
	// Constructor
	
	this.__defineGetter__("last",RuleList.prototype.last);
};

RuleList.prototype = [];

RuleList.prototype.last = function() {
	
	if (!this.length) return;
	
	return this[this.length-1];
};

RuleList.prototype.append = function(input) {
	var list = this;
	
	if (!(input instanceof RuleList))
		throw new Error("Only RuleLists may be appended.");
	
	input.forEach(function(rule) {
		list.push(rule);
	});
	
};


var SelectorGroup = function(parts) {
	this.children		= new RuleList();
	this.assertions		= [];
	
	console.log(parts);
}

SelectorGroup.prototype = Ruleset.prototype;



var Assertion = function(rule) {
	
};

Assertion.prototype.test = function() {
	
};



module.exports = {
	"RuleList":			RuleList,
	"Ruleset":			Ruleset,
	"SelectorGroup":	SelectorGroup,
	"Assertion":		Assertion
};