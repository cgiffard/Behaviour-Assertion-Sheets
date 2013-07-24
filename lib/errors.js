// AssertionError definition

var AssertionError = function(severity,assertion,node) {
	this.node = node || null;
	this.assertion = assertion || null;
	this.severity = severity || 0;
};

AssertionError.prototype = new Error();

AssertionError.prototype.toString = function(verbose) {
	
};

module.exports = AssertionError();