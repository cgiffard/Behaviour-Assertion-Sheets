var BAS = require("bas"),
	testSuite = new BAS();

testSuite
	.loadSheet("validation.bas")
	.loadSheet("aboutpages.bas")
	.loadSheet("accessibility.bas");

testSuite
	.registerTest("haslength",function(pageData,params) {
		// pageData.dom
		return pageData.text.length > 0;
	});

testSuite
	.registerTest("title",function(pageData,params) {
		// pageData.dom
		return pageData.document.search("title")[0].innerText;
	});

function onresponse(myData) {

	testSuite
		.run(url,res,myData)
		.error(function(errorlist) {

		})
		.complete(function() {

		});

}

function oncomplete() {
	console.log("\n\nReport!\n\n");
	console.log(
		"%d tests run against %d pages, a total of % times.",
		testSuite.stats.testCount,
		testSuite.stats.pagesTested,
		testSuite.stats.testsRun
	);
	
	console.log("There were %s errors.",(testSuite.errors.length||"no"));
	
	testSuite.errors.forEach(function(error) {
		console.log(error.source.red);
		console.log(error.details.blue.indent(1));
		console.log(error.annotations.indent(1));
	});
}