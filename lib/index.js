/* Bas.

8 888888888o          .8.            d888888o.   
8 8888    `88.       .888.         .`8888:' `88. 
8 8888     `88      :88888.        8.`8888.   Y8 
8 8888     ,88     . `88888.       `8.`8888.     
8 8888.   ,88'    .8. `88888.       `8.`8888.    
8 8888888888     .8`8. `88888.       `8.`8888.   
8 8888    `88.  .8' `8. `88888.       `8.`8888.  
8 8888      88 .8'   `8. `88888.  8b   `8.`8888. 
8 8888    ,88'.888888888. `88888. `8b.  ;8.`8888 
8 888888888P .8'       `8. `88888. `Y8888P ,88P' 

2013 Christopher Giffard
Behaviour Assertion Sheets - Main

*/

var yoyaku			= require("yoyaku"),
	parser			= require("csstree"),
	cheerio			= require("cheerio"),
	EventEmitter	= require("events").EventEmitter,
	fs				= yoyaku.api(require("fs"));

var RuleList		= require("./rules").RuleList,
	Ruleset			= require("./rules").Ruleset,
	Assertion		= require("./rules").Assertion,
	SelectorGroup	= require("./rules").SelectorGroup,
	processTree		= require("./processor"),
	defTests		= require("./tests");

var BAS = function(options) {
	
	var errors = [],
		tests = defTests,
		rules = new RuleList(),
		testCount = 0,
		pagesTested = 0,
		testsRun = 0;
		
	options = options || {};
	
	errors.clear = function() {
		errors.length = 0;
	};
	
	// Directly on object
	this.__defineGetter__("errors",	function() { return errors;	});
	this.__defineGetter__("tests",	function() { return tests;	});
	this.__defineGetter__("rules",	function() { return rules;	});
	
	
	this.__defineGetter__("stats", function() {
		var stats = {};
		
		stats.__defineGetter__("testCount",
			function() { return +testCount;		});
		
		stats.__defineGetter__("pagesTested",
			function() { return +pagesTested;	});
		
		stats.__defineGetter__("testsRun",
			function() { return +testsRun;		});
		
		return stats;
		
	});
	
	// Save some defaults onto our object...
	this.continueOnParseFail = options.continueOnParseFail || false;
};

BAS.prototype = new EventEmitter;

BAS.prototype.loadSheet = yoyaku.yepnope(function(sheet,promises) {
	var bas = this;
	
	function load(sheetData) {
		var tree = parser(sheetData.toString("utf8"));
		bas.rules.append(processTree(tree));
		promises.yep(bas);
		bas.emit("loadsheet");
	}
	
	if (sheet instanceof Buffer) {
		
		load(sheet);
		
	} else if (typeof sheet === "string") {
		
		fs.readFile(sheet)
			.yep(load)
			.nope(promises.nope);
			
	} else {
		promises.nope(
			new Error("You must supply a buffer or string filename."));
	}
});

BAS.prototype.registerTest = function(name,func) {
	
	if (!(func instanceof Function))
		throw new Error("Tests must be a function.");
	
	this.tests[name] = func;
	this.emit("testregistered",name,func);
};

BAS.prototype.run = yoyaku.yepnope(function(url,res,data,promises) {
	
	var self = this, $, parseError;
	
	// Some big binary files cause cheerio to choke (understandably.)
	// We re-emit the exception with a friendlier message so we know what
	// happened.
	try {
		$ = cheerio.load(data);
		
	} catch (e) {
		parseError = 
			new Error(
				"Failed to load document data. Parse failed with message: " +
				e.message);
		
		// Unless we've been otherwise instructed, this is a bailout situation.
		if (!self.continueOnParseFail)
			throw parseError;
		
		// Or if we're asked to continue, emit the error...
		self.emit("parserror",parseError);
		
		// And load in a blank document to run the test suite with anyway.
		$ = cheerio.load("");
	}
	
	function checkAssertion(documentState,assertion,node,selector) {
		self.emit("assertion",assertion,node);
		
		var result = assertion.test(documentState,self.tests,node);
		
		if (!result) {
			assertionError(assertion,documentState,node,selector);
			
		} else {
			
			self.emit("assertionsuccess",assertion,node);
		}
	}
	
	function assertionError(assertion,documentState,node,selector) {
		var assertionErr = assertion.toError(documentState,self.tests,node,selector);
		self.emit("assertionfailed",assertionErr,assertion);
		
		assertionErr.forEach(function(err) {
			self.errors.push(err);
		})
	}
	
	function processSelector(selector,documentState,inputNode) {
		var nodes = selector.getNodes(documentState,inputNode);
		
		self.emit("selector",selector,nodes);
		
		if (!nodes.length && selector.isRequired()) {
			assertionError(selector.isRequired(),documentState,inputNode);
		}
		
		nodes.each(function(index,node) {
			documentState.selectionLength = nodes.length;
			
			selector.assertions.forEach(function(assertion) {
				checkAssertion(documentState,assertion,node,String(selector));
			});
		});
		
		if (nodes.length && selector.children) {
			selector.children.forEach(function(child) {
				if (child instanceof SelectorGroup)
					processSelector(child,documentState);
			});
		}
	}
	
	function testRuleGroup(rule) {
		
		var documentState = {
			"url": url,
			"res": res,
			"data": data,
			"document": $,
			"tests": self.tests
		};
		
		// This rule isn't valid for this URL.
		if (!rule.validFor(documentState,self.tests)) return;
		
		self.emit("startgroup",rule);
		
		// Run any assertions applied directly to this rulegroup
		rule.assertions.forEach(function(assertion) {
			checkAssertion(documentState,assertion);
		});
		
		if (rule.children) {
			rule.children.forEach(function(child) {
				
				if (child instanceof SelectorGroup)
					processSelector(child,documentState);
				
			})
		}
	}
	
	this.emit("start",url);
	
	// Clear errors before running the test
	this.errors.clear();
	this.rules.forEach(testRuleGroup);
	
	// Let everybody know we've finished
	this.emit("end",url,this.errors);
	promises.yep(this.errors);
});

module.exports = BAS;