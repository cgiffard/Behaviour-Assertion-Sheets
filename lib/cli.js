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
	.option("-q --quiet",			"Suppress output (prints report/json only)")
	.option("-v --verbose",			"Verbose output")
	.option("-j --json",			"Output list of errors as JSON")
	.parse(process.argv);
	
function log() {
	if (!basCLI.quiet)
		console.log.apply(console,arguments);
}

function error() {
	if (!basCLI.quiet)
		console.error.apply(console,arguments);
}


if (!basCLI.args.length) {
	error("You must specify at least one URL to test against.");
}

if (basCLI.sheet) {
	
	log("Using behaviour assertion sheet: %s",basCLI.sheet.yellow);
	
	testSuite.loadSheet(basCLI.sheet)
		.yep(requestData);
	
} else {
	
	log("Waiting for BAS input from STDIN.");
	
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
	log("Commencing initial data request.\nSpooled URLs are:");
	basCLI.args.forEach(function(url) {
		log(("\t" + url).blue);
	});
	
	if (basCLI.crawl) {
		log("We're crawling based on these URLs.");
		startCrawl();
	} else {
		// basCLI.args.
	}
}

var handleResponse = yoyaku.yepnope(function(url,res,data,promises) {
	
	// Temporarily halt the crawl while we run tests
	if (crawl) crawl.stop();
	
	log("Testing resource: %s",url.blue);
	
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
			error("Failed to run test suite for %s".red,url.blue);
			error(err.message.red);
			
			if (!err.message.match(/RangeError/)) {
				error(err.stack);
				process.exit(1);
			}
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
		error(
			util.format("Unable to download '%s' due to request/service error. (%d)",
				queueItem.url,
				res.statusCode).red);
		
		requestErrs[queueItem.url] = res.statusCode;
	});
	
	crawl.on("fetch404",function(queueItem,res) {
		error(
			util.format("404: Resource missing: '%s'.",queueItem.url)
				.yellow);
		
		requestErrs[queueItem.url] = res.statusCode;
		handleResponse(queueItem.url,res,"");
	});
	
	crawl.on("complete",printReport);
}


if (basCLI.verbose) {
	testSuite.on("start",function(url) {
		log("\tCommencing BAS test suite");
	});
	
	testSuite.on("startgroup",function(rule) {
		log("\tStarting test group: " + String(rule).yellow);
	});
	
	testSuite.on("selector",function(selector) {
		log("\t\tTesting selector " + String(selector).yellow);
	});
	
	testSuite.on("assertion",function(assertion) {
		log("\t\t\tTesting assertion " + String(assertion).yellow);
	});
	
	testSuite.on("assertionsuccess",function(assertion) {
		log(("\t\t\t\t✔  " + assertion).green);
	});
}

testSuite.on("assertionfailed",function(errors,assertion) {
	var indent = "";
	
	if (basCLI.verbose)
		indent = "\t\t\t";
	
	error((indent + "\t✘ Assertion failed: " + assertion).red);
	errors.forEach(function(assertionError) {
		error(indent + "\t\t" + String(assertionError).red);
	})
});

testSuite.on("end",function(url) {
	if (basCLI.verbose) {
		
		log("\tBAS test suite completed with " +
				(testSuite.errors.length ? "errors:" : "no errors."));
		
		testSuite.errors.forEach(function(assertionError) {
			error("\t\t" + String(assertionError).red);
		});
	}
	
	// Retain errors globally...
	if (testSuite.errors.length) {
		errorBatch[url] = [];
		errorCount += testSuite.errors.length;
		
		testSuite.errors.forEach(function(assertionError) {
			errorBatch[url].push({
				"message": assertionError.message,
				"selector": assertionError.selector,
				"nodePath": assertionError.nodePath,
			});
		});
	}
});


function printReport() {
	
	if (!basCLI.json) {
		console.log("\nTest batch completed. (%d requests)",pagesTested);
		
		if (errorCount) {
			console.error("%d assertion failures encountered over batch.".red,errorCount);
			
			var pageErrors = [];
			for (var idx in errorBatch) {
				if (!errorBatch.hasOwnProperty(idx))
					continue;
				
				pageErrors = errorBatch[idx];
				
				console.log("\n" + idx.blue);
				console.error("\t%d failed assertions: ".red,pageErrors.length);
				
				pageErrors.forEach(function(error) {
					console.error("\t\t" + String(error.message).red);
					
					if (error.selector) {
						console.error("\t\t\tSelector: " + String(error.selector).yellow);
					}
					
					if (basCLI.verbose && error.nodePath) {
						console.error("\t\t\tNode Path: " + String(error.nodePath).yellow);
					}
				});
			}
			
		} else {
			
			console.log("No assertion failures encountered over batch.".green);
		}
		
	} else {
		
		process.stdout.write(JSON.stringify(errorBatch));
		
	}
	
	process.exit(0);
}

process.on("SIGINT",printReport);