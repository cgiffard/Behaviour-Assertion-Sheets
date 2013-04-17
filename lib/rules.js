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

SelectorGroup.prototype = new Ruleset([""]);

SelectorGroup.prototype.toString = function() {
	return this.selector.join(" ");
};

SelectorGroup.prototype.getNodes = function(documentState,node) {
	// Better, preprocessed selector algorithm soon.
	// For the moment this is a hack.
	
	var selector =
		(function flattenSelector(list,depth) {
			
			return list.map(function(listItem) {
				
				if (typeof listItem === "object" ||
					listItem instanceof Array) {
					
					return flattenSelector(listItem,depth?depth+1:1);
					
				}
				
				return listItem;
				
			}).join(depth ? "" : " ");
			
		})(this.selector);
	
	var $ = documentState.document,
		nodes = $(selector,node);
	
	return nodes;
};

SelectorGroup.prototype.isRequired = function() {
	var required = false;
	
	this.assertions.forEach(function(assertion) {
		
		// No point continuing testing if we've already found one.
		if (required) return;
		
		if (String(assertion.subject) === "required") {
			if (assertion.assertion(true))
				required = assertion;
		}
	});
	
	return required;
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
	args =
		args.map(function(arg) {
			return arg.replace(/^\s*/,"").replace(/\s*$/,"");
		})
		.filter(function(arg) {
			return !!arg.length;
		});
	
	// Process the raw assertion string into individual components
	assertions = parseStatement(rawAssertion);
	
	// Now process the individual assertion components!
	assertions = assertions.map(generateAssertion);
	
	// Function for generating assertions...
	function generateAssertion(component) {
		if (component.match(/^["'].*["']$/)) {
			
			// Simple string match.
			// Clean off the string delimiters before comparing...
			
			component =
				component
					.replace(/^["']/,"")
					.replace(/["']$/,"");
			
			return function(input) {
				var result = input == component;
				
				if (!result) {
					throw new Error(
						rawSubject + ": " +
						"String expectation '" + component + "' " +
						"failed to match input: '" +
						helpers.trim(input) +
						"' (" + component + ")"
					);
				}
			};
			
		} else if (component.match(/^[\d\.]+$/)) {
			
			// Simple numeric match. (treat as float)
			
			return function(input) {
				var result = parseFloat(input) == parseFloat(component);
				
				if (!result) {
					throw new Error(
						rawSubject + ": " +
						"Numeric expectation '" + component + "' " +
						"failed to match input: '" +
						helpers.trim(input) +
						"' (" + component + ")"
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
						"failed to match input: '" +
						helpers.trim(input) +
						"' (" + component + ")"
					);
				}
			};
		
		} else if (component.match(/^\!\/.*\/[a-z]+$/i)) {
			
			// Negated regular expression.
			
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
						"failed to match input: '" +
						helpers.trim(input) +
						"' (" + component + ")"
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
						"against input '" + helpers.trim(input) + "'."
					);
				}
			};
			
		} else {
			
			throw new Error(
				"Could not parse assertion component:" + component);
		
		}
	}
	
	var assertion = function(testResult,returnErrors,url,nodePath,selector) {
		var errorList = [];
		
		assertions.forEach(function(assertion) {
			try {
				assertion(testResult);
			} catch(e) {
				
				// Save our the URL and node path if available so we can track
				// down where this error came from later!
				if (!!nodePath)	e.nodePath = nodePath;
				if (!!url)		e.url = url;
				if (!!selector)	e.selector = selector;
				
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

Assertion.prototype.test =
	function(documentState,tests,node,returnErrors,selector) {
	
	if (!documentState || !tests)
		throw new Error("You must supply both documentState and a test map.");
	
	if (!tests[this.subject])
		throw new Error("Test " + this.subject + " not found in map.");
	
	var url = documentState.url,
		nodePath = node ? helpers.getNodePath(node) : "";
	
	// Test the parameter in question.
	var testResult =
		tests[this.subject]
			.apply(
				tests[this.subject],
				[documentState,node].concat(this.arguments));
	
	// Now compare it against the assertion!
	return this.assertion(testResult,!!returnErrors,url,nodePath,selector);
};

Assertion.prototype.toError = function(documentState,tests,node,selector) {
	if (!documentState || !tests)
		throw new Error("You must supply both documentState and a test map.");
	
	return this.test(documentState,tests,node,true,selector);
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