// Rule list definition

var RuleList = function() {
	// Constructor
	this.parent = null;
	
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

RuleList.prototype.push = function(input) {
	input.parent = this;
	[].push.call(this,input);
};

module.exports = RuleList;