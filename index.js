
var testData = require("fs").readFileSync("./behaviourTest.test").toString("utf8");

var CSSTree = require("csstree"),
	tree = new CSSTree(testData),
	processTree = require("./lib/processor");

console.log(JSON.stringify(processTree(tree),null,4));