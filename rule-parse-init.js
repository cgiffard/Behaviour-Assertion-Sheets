#!/usr/bin/env node

var yoyaku		= require("yoyaku"),
	request		= yoyaku.yepnope(require("request")),
	BAS			= require("./"),
	testSuite	= new BAS();

request
	.defer("https://github.com/")
	.yep(function(req,data) {
		testSuite.run("https://github.com/",req,data);
	});

testSuite
	.loadSheet(__dirname + "/test/sheets/github.bas")
	.yep(request.last);

testSuite.on("start",function() {
	console.log("Starting test suite...");
});

testSuite.on("testregistered",function(name,func) {
	console.log("A new test, '%s', was registered.",name);
});

testSuite.on("startgroup",function(rule) {
	console.log("Starting test group: ",rule);
});

testSuite.on("testassertion",function(assertion) {
	console.log("Testing assertion ",assertion);
});

testSuite.on("assertionfailed",function(assertion) {
	console.log("Assertion failed: ",assertion);
});

testSuite.on("end",function() {
	console.log("Test Suite Completed. Errors:");
	testSuite.errors.forEach(function(error) {
		console.log(error);
	});
});