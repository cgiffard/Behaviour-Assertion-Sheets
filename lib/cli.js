#!/usr/bin/env node

var	crawler		= require("simplecrawler"),
	basCLI		= require("commander"),
	colors		= require("colors"),
	yoyaku		= require("yoyaku"),
	request		= require("request"),
	url			= require("url"),
	util		= require("util"),
	BAS			= require("./index"),
	packageInfo	= require("../package.json"),
	testSuite	= new BAS(),
	crawl		= null;

var errorBatch	= {},
	errorCount	= 0,
	requestErrs	= {},
	pagesTested	= 0;

basCLI
	.version(packageInfo.version)
	.option("-c --crawl",			"Crawl from the specified URLs")
	.option("-s --sheet [filename]","Test using the specified BAS")
	.option("-l --limit [number]",	"Limit number of resources to request when crawling")
	.option("-d --die",				"Die on first error")
	.option("-v --verbose",			"Verbose output")
	.option("-j --json",			"Output list of errors as JSON")
	.parse(process.argv);


if (!basCLI.args.length) {
	console.error("You must specify at least one URL to test against.");
}

if (basCLI.sheet) {
	
	console.log("Using behaviour assertion sheet: %s",basCLI.sheet.yellow);
	
	testSuite.loadSheet(basCLI.sheet)
		.yep(requestData);
	
} else {
	
	console.log("Waiting for BAS input from STDIN.");
	
	var stdinBuffer = "";
	
	process.stdin.resume();
	process.stdin
		.on("data",function(chunk){
			stdinBuffer += chunk.toString();
		})
		.on("end",function(){
			testSuite.loadSheet(Buffer(stdinBuffer))
				.yep(requestData);
		});
}

function requestData() {
	console.log("Commencing initial data request.\nSpooled URLs are:");
	basCLI.args.forEach(function(url) {
		console.log(("\t" + url).blue);
	});
	
	if (basCLI.crawl) {
		console.log("We're crawling based on these URLs.");
		startCrawl();
	} else {
		// basCLI.args.
	}
}

var handleResponse = yoyaku.yepnope(function(url,res,data,promises) {
	
	// Temporarily halt the crawl while we run tests
	if (crawl) crawl.stop();
	
	console.log("Testing resource: %s",url.blue);
	
	pagesTested ++;
	
	testSuite.run(url,res,data)
		.yep(function() {
			
			if (!basCLI.limit || pagesTested < parseInt(basCLI.limit,10)) {
				
				// Resume crawl, if that's what we're doing.
				if (crawl) crawl.start();
				
			} else {
				// We're done here!
				printReport();
			}
			
		})
		.nope(function(err) {
			console.error("Failed to run test suite for %s".red,url.blue);
			console.error(err.message.red);
		});
});

function startCrawl() {
	crawl = crawler.crawl(basCLI.args[0]);
	
	// Limit concurrency so assertion messages make sense. (Are in order.)
	crawl.maxConcurrency = 1;
	
	// Get all the domains out of the inputted URLs, sort, deduplicate and add
	// them to the crawler whitelist
	var domains =
		basCLI.args
		.map(function(urlString) {
			return String(url.parse(urlString).hostname).toLowerCase();
		})
		.sort()
		.reduce(function(prev,cur,idx,arr) {
			if (prev[prev.length-1] !== cur)
				prev.push(cur);
			
			return prev;
		},[])
		.forEach(function(domain) {
			crawl.domainWhitelist.push(domain);
		});
	
	// Now queue any URLs we still haven't put in...
	basCLI.args.forEach(crawl.queueURL.bind(crawl));
	
	crawl.on("fetchcomplete",function(queueItem,data,res) {
		handleResponse(queueItem.url,res,data);
	});
	
	crawl.on("fetchredirect",function(queueItem,res) {
		handleResponse(queueItem.url,res,"");
	});
	
	crawl.on("fetcherror",function(queueItem,res) {
		console.error(
			util.format("Unable to download '%s' due to request/service error. (%d)",
				queueItem.url,
				res.statusCode).red);
		
		requestErrs[queueItem.url] = res.statusCode;
	});
	
	crawl.on("fetch404",function(queueItem,res) {
		console.error(
			util.format("404: Resource missing: '%s'.",queueItem.url)
				.yellow);
		
		requestErrs[queueItem.url] = res.statusCode;
		handleResponse(queueItem.url,res,"");
	});
	
	crawl.on("complete",printReport);
}


if (basCLI.verbose) {
	testSuite.on("start",function(url) {
		console.log("\tCommencing BAS test suite");
	});
	
	testSuite.on("startgroup",function(rule) {
		console.log("\tStarting test group: " + String(rule).yellow);
	});
	
	testSuite.on("selector",function(selector) {
		console.log("\t\tTesting selector " + String(selector).yellow);
	});
	
	testSuite.on("assertion",function(assertion) {
		console.log("\t\t\tTesting assertion " + String(assertion).yellow);
	});
	
	testSuite.on("assertionsuccess",function(assertion) {
		console.log(("\t\t\t\t✔  " + assertion).green);
	});
}

testSuite.on("assertionfailed",function(errors,assertion) {
	var indent = "";
	
	if (basCLI.verbose)
		indent = "\t\t\t";
	
	console.error((indent + "\t✘ Assertion failed: " + assertion).red);
	errors.forEach(function(error) {
		console.error(indent + "\t\t" + String(error).red);
	})
});

testSuite.on("end",function(url) {
	if (basCLI.verbose) {
		
		console.log("\tBAS test suite completed with " +
					(testSuite.errors.length ? "errors:" : "no errors."));
		
		testSuite.errors.forEach(function(error) {
			console.error("\t\t" + String(error).red);
		});
	}
	
	// Retain errors globally...
	errorBatch[url] = testSuite.errors;
	errorCount += testSuite.errors.length;
	
});


function printReport() {
	console.log("\nTest batch completed. (%d requests)",pagesTested);
	
	if (errorCount) {
		console.error("%d assertion failures encountered over batch.".red,errorCount);
		
		var pageErrors = [];
		for (var idx in errorBatch) {
			if (!errorBatch.hasOwnProperty(idx))
				continue;
			
			console.log("\n" + idx.blue);
			
			
		}
		
	} else {
		
		console.log("No assertion failures encountered over batch.".green);
	}
	
	process.exit(0);
}