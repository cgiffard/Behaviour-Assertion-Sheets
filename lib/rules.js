// Rule container classes

var parseStatement	= require("./statement-parser"),
	barewords		= require("./barewords"),
	operators		= require("./operators"),
	helpers			= require("./helpers");

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
	
	var operators = require("./operators");
	
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
	this.selector		= parts;
	this.annotations	= [];
}

SelectorGroup.prototype = Ruleset.prototype;

SelectorGroup.prototype.execute = function(documentState,node) {
	var $ = documentState.document;
	
	
	
};


var Assertion = function(rule) {
	this.annotations	= [];
	this.position		= rule.position;
	
	var rawSubject		= rule.property,
		rawAssertion	= rule.value;
	
	// Parse the assertion
	var subjectParts	= rawSubject.split(/[\(\,\)]/),
		subject			= subjectParts.slice(0,1),
		args			= subjectParts.slice(1),
		assertions		= [];
		
	// Trip spacing from args...
	args = args.map(function(arg) {
		return arg.replace(/^\s*/,"").replace(/\s*$/,"");
	});
	
	// Process the raw assertion string into individual components
	assertions = parseStatement(rawAssertion);
	
	// Now process the individual assertion components!
	assertions = 
		assertions.map(function(component) {
			if (component.match(/^["'].*["']$/)) {
				// Simple string match.
				// Clean off the string delimiters before comparing...
				component =
					component
						.replace(/^["']/)
						.replace(/["']$/);
				
				return function(input) {
					var result = input == component;
					
					if (!result) {
						throw new Error(
							rawSubject + ": " +
							"String expectation '" + component + "' " +
							"failed to match input: '" + input + "'"
						);
					}
				};
			
			} else if (component.match(/^\/.*\/[a-z]+$/i)) {
				// Regular expression.
				return function(input) {
					var result = (
						new RegExp(
								helpers.cleanRE(component),
								helpers.reParams(component)))
									.exec(input);
					
					if (!result) {
						throw new Error(
							rawSubject + ": " +
							"Regular expression '" + component + "' " +
							"failed to match input: '" + input + "' (" +
							component + ")"
						);
					}
				};
			
			} else if (component.match(/^\!\/.*\/[a-z]+$/i)) {
				// Negated egular expression.
				return function(input) {
					var result = !(
						new RegExp(
								helpers.cleanRE(component),
								helpers.reParams(component)))
									.exec(input);
					
					if (!result) {
						throw new Error(
							rawSubject + ": " +
							"Negated regular expression '" + component + "' " +
							"failed to match input: '" + input + "' (" +
							component + ")"
						);
					}
				};
			
			} else if (component.match(/^[a-z0-9]+.*[\)]*$/)) {
				
				// Bareword or bareword function call.
				
				var cleanComp		= component.replace(/\)$/,""),
					bwComponents	= cleanComp.split(/\(/),
					bareword		= bwComponents.slice(0,1),
					bwArgs			= bwComponents.slice(1).join(")");
				
				if (!barewords[bareword])
					throw new Error("Unknown assertion bareword: " + bareword);
				
				// Parse the arguments using the same algorithm.
				bwArgs = parseStatement(bwArgs);
				
				return function(input) {
					var result =
							barewords[bareword]
								.apply(null,[input].concat(bwArgs));
					
					if (!result) {
						throw new Error(
							"'" + rawSubject + "' expects " + component + ": " +
							"Component test '" + bareword + "' failed " +
							"against input '" + input + "'."
						);
					}
				};
				
			} else {
				
				throw new Error(
					"Could not parse assertion component:" + component);
			
			}
		});
	
	var assertion = function(testResult,returnErrors) {
		var errorList = [];
		
		assertions.forEach(function(assertion) {
			try {
				assertion(testResult);
			} catch(e) {
				errorList.push(e);
			}
		});
		
		if (returnErrors)
			return errorList;
		
		return !errorList.length;
	};
	
	// Assign final values to object
	this.assertion		= assertion;
	this.rawAssertion	= rawAssertion;
	this.subject		= subject;
	this.arguments		= args;
};

Assertion.prototype.test = function(documentState,tests,node,returnErrors) {
	
	if (!documentState || !tests)
		throw new Error("You must supply both documentState and a test map.");
	
	if (!tests[this.subject])
		throw new Error("Test " + this.subject + " not found in map.");
	
	// Test the parameter in question.
	var testResult =
		tests[this.subject]
			.apply(
				tests[this.subject],
				[documentState,node].concat(this.args));
	
	// Now compare it against the assertion!
	return this.assertion(testResult,!!returnErrors);
};

Assertion.prototype.toError = function(documentState,tests,node) {
	if (!documentState || !tests)
		throw new Error("You must supply both documentState and a test map.");
	
	return this.test(documentState,tests,node,true);
};

Assertion.prototype.describe = function() {
	return [this.subject, this.arguments, this.rawAssertion];
};

Assertion.prototype.toString = function() {
	var description	= this.describe(),
		subject		= description[0],
		args		= description[1],
		assertion	= description[2];
	
	return (
		subject + (
			args.length ? "(" + args.join(",") + ")" : ""
		) +
		": " +
		assertion
	);
}

module.exports = {
	"RuleList":			RuleList,
	"Ruleset":			Ruleset,
	"SelectorGroup":	SelectorGroup,
	"Assertion":		Assertion
};