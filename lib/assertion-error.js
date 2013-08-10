// AssertionError definition

var helpers = require("./helpers");

var AssertionError = function(assertion,component,actual) {
	this.url			= null;
	this.selector		= null;
	this.assertion		= assertion || null;
	this.severity		= assertion ? (assertion.severity||0) : 0;
	this.annotations	= assertion ? assertion.getAnnotationTree() : [];
	this.subject		= assertion ? assertion.rawSubject : null;
	this.component		= component || null;
	this.actual			= actual || null;
	this.node 			= null;
	this.nodePath		= null;
	
	this.__defineGetter__("message",this.toString);
};

AssertionError.prototype = new Error();

AssertionError.prototype.addNode = function(node) {
	if (!node) return;
	
	this.node = helpers.getReadableNode(node);
	this.nodePath = helpers.getNodePath(node);
	
	return this.node;
};

AssertionError.prototype.toString = function(verbose) {
	
	if (this._message) return this._message;
	
	var message = "",
		component = this.component,
		bareword = (component||"").split(/\(/)[0];
	
	if (!component)
		return "Unknown Assertion Error";
	
	if (component.match(/^[a-z0-9]+.*[\)]*$/) ||
		component.match(/^\![a-z0-9]+.*[\)]*$/)) {
			
		message = this.subject + " expects " + "'" + component + "': ";
		
	} else {
		message = this.subject + ": "
	}
	
	if (component.match(/^["'].*["']$/))
		message += "String expectation '" + component + "'";
	
	if (component.match(/^[\d\.]+$/))
		message += "Numeric expectation '" + component + "'";
	
	if (component.match(/^\/.*\/[a-z]*$/i))
		message += "Regular expression '" + component + "'";
	
	if (component.match(/^\!\/.*\/[a-z]*$/i))
		message += "Negated regular expression '" + component + "'";
	
	if (component.match(/^[a-z0-9]+.*[\)]*$/))
		message += "Component test '" + bareword + "'";
	
	if (component.match(/^\![a-z0-9]+.*[\)]*$/))
		message += "Negated component test '" + bareword + "'";
	
	
	// Rest of message!
	message += " failed against input '" + helpers.trim(this.actual) + "'.";
	
	this._message = message;
	return message;
};

module.exports = AssertionError;