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

var RuleList	= require("./rules").RuleList,
	Ruleset		= require("./rules").Ruleset,
	Assertion	= require("./rules").Assertion;

var BAS = function() {
	
	var stats = {},
		errors = [],
		rules = new RuleList(),
		testCount = 0,
		pagesTested = 0,
		testsRun = 0;
	
	stats.__defineGetter__("testCount",		function() { return testCount; });
	stats.__defineGetter__("pagesTested",	function() { return pagesTested; });
	stats.__defineGetter__("testsRun",		function() { return testsRun; });
	
	// Directly on object
	this.__defineGetter__("stats",			function() { return stats; });
	this.__defineGetter__("errors",			function() { return errors; });
	
	
};



BAS.prototype.loadSheet = function(sheet) {
	
};

BAS.prototype.registerTest = function(name,func) {

};

BAS.prototype.run = function(name,func) {

};