var testData = require("fs").readFileSync("./behaviourTest.test").toString("utf8");

var parser = require("css-parse");

console.log(
	JSON.stringify(
		parser(testData)
		,null,4));
		
var cssom = require("cssom");

console.log(
	JSON.stringify(
		cssom.parse("")
		,null,4));

var CSSTree = require("csstree");

console.log(
	JSON.stringify(
		(new CSSTree(testData))
		,null,4));