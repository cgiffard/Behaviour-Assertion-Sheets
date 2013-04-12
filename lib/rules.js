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
	// console.log("conditional",input);
	this.conditions.push(input);
};

Ruleset.prototype.addAnnotation = function(input) {
	
	input =
		input
			.replace(/^\/\*\@\s*/i,"")
			.replace(/\s*\*\//i,"")
			.replace(/[\n\r]+/," ");
	
	this.annotations.push(input);
};

Ruleset.prototype.validFor = function(url) {
	
	var conditions = this.input.slice(1);
	
	// 'all' rulesets run on every page.
	if (this.kind === "all") return true;
	
	// If we've got a page-specific ruleset, we need to check
	// its conditions first
	if (this.kind === "page") {
		
		console.log(conditions);
	}
	
	return false;
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