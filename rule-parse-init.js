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
	.addTest(function() {
		
	})

testSuite
	.loadSheet(__dirname + "/test/sheets/github.bas")
	.yep(request.last);