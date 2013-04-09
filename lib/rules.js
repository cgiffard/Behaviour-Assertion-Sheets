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
	this.rules			= [];
	
	if (String(input[0]).match(/^@page/))
		this.kind = "page";
	
	if (String(input[0]).match(/^@page/))
		this.kind = "all";
	
	// Add the conditions for this ruleset to run...
	input.slice(1).forEach(this.addCondition.bind(this));
};

Ruleset.prototype.addRule = function(input) {
	this.rules.push(input);
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




var RuleList = function() {
	// Constructor
	
	this.__defineGetter__("last",RuleList.prototype.last);
};

RuleList.prototype = [];

RuleList.prototype.last = function() {
	
	if (!this.length) return;
	
	return this[this.length-1];
};



module.exports = {
	"RuleList": RuleList,
	"Ruleset": Ruleset
};