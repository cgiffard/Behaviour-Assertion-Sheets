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
	util			= require("util"),
	fs				= yoyaku.api(require("fs"));

var RuleList		= require("./rule-list"),
	Ruleset			= require("./rule-set"),
	Assertion		= require("./assertion"),
	SelectorGroup	= require("./selector-group"),
	processTree		= require("./processor"),
	defTests		= require("./tests");

var BAS = function(options) {
	
	var errors = [],
		tests = defTests,
		rules = new RuleList(),
		testCount = 0,
		assertionsChecked = 0,
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
			function() { return +testCount;			});
		
		stats.__defineGetter__("assertionsChecked",
			function() { return +assertionsChecked;	});
		
		stats.__defineGetter__("testsRun",
			function() { return +testsRun;			});
		
		stats.reset = function() {
			testsRun = 0;
			assertionsChecked = 0;
			testCount = 0;
			
			return stats;
		};
		
		return stats;
		
	});
	
	// Save some defaults onto our object...
	this.continueOnParseFail = options.continueOnParseFail || false;
	
	this._set = function(set,to) {
		if (set === "testCount")
			return !!(testCount = to);
		
		if (set === "assertionsChecked")
			return !!(assertionsChecked = to);
		
		if (set === "testsRun")
			return !!(testsRun = to);
	};
};

util.inherits(BAS,EventEmitter);

BAS.prototype.loadSheet = yoyaku.yepnope(function(sheet,promises) {
	var self = this;
	
	if (sheet instanceof Buffer) {
		
		self.parseSheet(sheet)
			.yep(promises.yep);
		
	} else if (typeof sheet === "string") {
		
		fs.readFile(sheet)
			.yep(function(data) {
				self.parseSheet(data).yep(promises.yep);
			})
			.nope(promises.nope);
			
	} else {
		promises.nope(
			new Error("You must supply a buffer or string filename."));
	}
});

BAS.prototype.parseSheet = yoyaku.yepnope(function(sheetData,promises) {
	var self = this,
		tree = parser(sheetData.toString("utf8"));
	
	self.rules.append(processTree(tree));
	self.emit("loadsheet");
	
	promises.yep(self);
});

BAS.prototype.registerTest = function(name,func) {
	
	if (!(func instanceof Function))
		throw new Error("Tests must be a function.");
	
	this.tests[name] = func;
	this.emit("testregistered",name,func);
};

BAS.prototype.run = yoyaku.yepnope(function(url,res,data,promises) {
	
	if (!(url && res && promises)) {
		throw new Error(
			"BAS.run() must be called with three arguments. " +
			"(url, res, data)");
	}
	
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
		});
	}
	
	function processSelector(selector,documentState,node) {
		var nodes = selector.getNodes(documentState,node);
		
		self.emit("selector",selector,nodes);
		
		if (!nodes.length && selector.isRequired()) {
			assertionError(selector.isRequired(),documentState,null,selector);
		}
		
		nodes.each(function(index,node) {
			documentState.selectionLength = nodes.length;
			
			selector.assertions.forEach(function(assertion) {
				checkAssertion(documentState,assertion,node,String(selector));
			});
		});
		
		if (nodes.length && selector.children) {
			selector.children.forEach(function(child) {
				if (!(child instanceof SelectorGroup)) return;
				
				if (child.nodeSpecific)
					return nodes.each(function(index,node) {
						processSelector(child,documentState,
							documentState.document(node));
					});
				
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
				
			});
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