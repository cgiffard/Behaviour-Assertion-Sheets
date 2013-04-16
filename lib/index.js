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

var BAS = function() {
	
	var errors = [],
		tests = defTests,
		rules = new RuleList(),
		testCount = 0,
		pagesTested = 0,
		testsRun = 0;
	
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
};

BAS.prototype = new EventEmitter;

BAS.prototype.loadSheet = yoyaku.yepnope(function(sheet,promises) {
	var bas = this;
	
	function load(sheetData) {
		var tree = parser(sheetData.toString("utf8"));
		bas.rules.append(processTree(tree));
		promises.yep(bas);
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
	
	var self = this,
		$ = cheerio.load(data);
	
	
	function checkAssertion(documentState,assertion,node) {
		self.emit("assertion",assertion,node);
		
		var result = assertion.test(documentState,self.tests,node);
		
		if (!result) {
			assertionError(assertion,documentState,node);
			
		} else {
			
			self.emit("assertionsuccess",assertion,node);
		}
	}
	
	function assertionError(assertion,documentState,node) {
		var assertionErr = assertion.toError(documentState,self.tests,node);
		self.emit("assertionfailed",assertionErr,assertion);
		self.errors.push(assertionErr);
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
				checkAssertion(documentState,assertion,node);
			});
			
			if (selector.children) {
				selector.children.forEach(function(child) {
					if (child instanceof SelectorGroup)
						processSelector(child,documentState,node);
				});
			}
		});
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