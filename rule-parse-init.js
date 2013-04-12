#!/usr/bin/env node

var request = require("request"),
	BAS = require("./"),
	testSuite = new BAS();
	
testSuite.loadSheet(__dirname + "/test/sheets/github.bas");
request("https://github.com/",function(err,res,body) {
	testSuite.run("https://github.com/",res,body);
});