// Operator functions for use in comparison operations.

var helpers = require("./helpers");

module.exports = {
	
	"=": function(a,b) {
		// Strict equality instead? Not sure.
		return a == b;
	},
	
	"!=": function(a,b) {
		return a != b;
	},

	"=~": function(a,b) {
		return !!(new RegExp(helpers.cleanRE(b),helpers.reParams(b))).exec(a);
	},
	
	"!=~": function(a,b) {
		return !(new RegExp(helpers.cleanRE(b),helpers.reParams(b))).exec(a);
	},
	
	">": function(a,b) {
		return parseFloat(a) > parseFloat(b);
	},
	
	"<": function(a,b) {
		return parseFloat(a) < parseFloat(b);
	},
	
	">=": function(a,b) {
		return parseFloat(a) >= parseFloat(b);
	},
	
	"<=": function(a,b) {
		return parseFloat(a) <= parseFloat(b);
	}
	
};