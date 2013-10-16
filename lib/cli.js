#!/usr/bin/env node

var	crawler		= require("simplecrawler"),
	basCLI		= require("commander"),
	colors		= require("colors"),
	yoyaku		= require("yoyaku"),
	request		= require("request"),
	url			= require("url"),
	util		= require("util"),
	async		= require("async"),
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
	.option("-c --crawl",					"Crawl from the specified URLs")
	.option("-s --sheet <filename>",		"Test using the specified BAS")
	.option("-l --limit <number>",			"Limit number of resources to request when crawling",parseInt)
	.option("-d --die",						"Die on first error")
	.option("-q --quiet",					"Suppress output (prints report/json only)")
	.option("-v --verbose",					"Verbose output")
	.option("-j --json",					"Output list of errors as JSON")
	.option("--csv",						"Output list of errors as CSV")
	.option("--noquery",					"Don't download resources with a querystring")
	.option("-u --username <username>",	"Username for HTTP Basic Auth (crawl)")
	.option("-p --password <passwprd>",	"Password for HTTP Basic Auth (crawl)")
	.parse(process.argv);

function log() {
	if (!basCLI.quiet)
		console.error.apply(console,arguments);
}

function error() {
	if (!basCLI.quiet)
		console.error.apply(console,arguments);
}

if (!basCLI.args.length) {
	error("You must specify at least one URL to test against.");
	process.exit(1);
}

var seedURLs = 
	basCLI.args.map(function(arg) {
		var parts, list = [];
		if ((parts = String(arg).match(/\%\{(\d+)\-(\d+)\}/))) {
			var from = +parts[1]|0,
				to = +parts[2]|0;
			
			if (from > to) {
				from = to;
				to = +parts[1]|0;
			}
			
			for (var index = from; index <= to; index++)
				list.push(String(arg).replace(/\%\{\d+\-\d+\}/i,index));
			
			return list;
		}
		
		return arg;
	})
	.reduce(function(prev,cur) {
		return prev.concat(cur);
	},[]);

if (basCLI.sheet) {
	
	log("Using behaviour assertion sheet: %s",basCLI.sheet.yellow);
	
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
			console.log("\nThanks, got it.");
			testSuite.loadSheet(Buffer(stdinBuffer))
				.yep(requestData);
		});
}

function requestData() {
	log("Commencing initial data request.\nSpooled URLs are:");
	basCLI.args.forEach(function(url) {
		log(("\t" + url).blue);
	});
	log("\n");
	
	
	if (basCLI.crawl) {
		log("We're crawling based on these URLs.");
		startCrawl();
	} else {
		// Build a sequence for async!
		var sequence = [];
		seedURLs.forEach(function(url) {
			sequence.push(function(done) {
				request(url,function(err,res,body) {
					if (err) return done(err);
					handleResponse(url,res,body,done);
				});
			});
		});
		
		async.series(sequence,printReport);
	}
}

var handleResponse = yoyaku.yepnope(function(url,res,data,promises) {
	
	// Temporarily halt the crawl while we run tests
	if (crawl) crawl.stop();
	
	var status = String(res.statusCode);
	status = res.statusCode < 400 ? status.green : status.red;
	
	pagesTested ++;
	
	var pagesToGo =
			basCLI.crawl ?
			(basCLI.limit < crawl.queue.length ? basCLI.limit : crawl.queue.length) :
			(basCLI.limit < seedURLs.length ? basCLI.limit : seedURLs.length);
				
	
	log("[%d/%d] Testing resource: (%s) %s",pagesTested,pagesToGo,status,url.blue);
	
	function testSuiteCompleted() {
		
		if (!basCLI.limit || pagesTested < parseInt(basCLI.limit,10)) {
			
			// Resume crawl, if that's what we're doing.
			if (crawl) crawl.start();
			
			// Hit that promise!
			promises();
			
		} else {
			// We're done here!
			printReport();
		}
		
	}
	
	testSuite.run(url,res,data)
		.yep(testSuiteCompleted)
		.nope(function(err) {
			error("Failed to run test suite for %s".red,url.blue);
			error(err.message.red);
			
			if (!err.message.match(/call stack/i) &&
				!err.message.match(/unable to execute selector/i)) {
				
				error(err.stack);
				process.exit(1);
			}
			
			testSuiteCompleted();
		});
});

function startCrawl() {
	crawl = crawler.crawl(seedURLs[0]);
	
	// Set a non-suspicious user-agent
	crawl.userAgent = "Behaviour Assertion Sheets " + packageInfo.version;
	
	// Limit concurrency so assertion messages make sense. (Are in order.)
	crawl.maxConcurrency = 10;
	
	// Interval
	crawl.maxConcurrency = 1;
	
	// Timeout to prevent test from choking
	crawl.timeout = 5000;
	
	// Auth?
	if (basCLI.username && basCLI.password) {
		crawl.authUser = basCLI.username;
		crawl.authPass = basCLI.password;
	}
	
	if (basCLI.noquery)
		crawl.addFetchCondition(function(url) {
			if (url.path !== url.uriPath) return false;
			return true;
		});
	
	// Get all the domains out of the inputted URLs, sort, deduplicate and add
	// them to the crawler whitelist
	var domains =
		seedURLs
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
	seedURLs.forEach(crawl.queueURL.bind(crawl));
	
	crawl.on("fetchcomplete",function(queueItem,data,res) {
		handleResponse(queueItem.url,res,data);
	});
	
	crawl.on("fetchredirect",function(queueItem,newURL,res) {
		error(util.format("Redirect --> %s".green,newURL.path));
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
		if (basCLI.verbose)
			error(
				util.format("404: Resource missing: '%s'.",queueItem.url)
					.yellow);
		
		requestErrs[queueItem.url] = res.statusCode;
		handleResponse(queueItem.url,res,"");
	});
	
	crawl.on("complete",printReport);
}

function jsonToCSV(input) {
	var csvOut = "";
	
	function csvEscape(text) {
		return (
			'"' + 
			String(text||"")
				.replace(/\"/ig,'""') +
			'"'
		);
	}
	
	csvOut += "URL,Annotations,Selector,Subject,Component,Actual,Node,NodePath,Message\n";
	
	function writeLine(error) {
		csvOut += 
			csvEscape(key) + "," +
			csvEscape(error.annotations.join(", ")) + "," +
			csvEscape(error.selector) + "," +
			csvEscape(error.subject) + "," +
			csvEscape(error.component) + "," +
			csvEscape(error.actual) + "," +
			csvEscape(error.node) + "," +
			csvEscape(error.nodePath) + "," +
			csvEscape(error.message) +
			"\n";
	}
	
	for (var key in input) {
		if (!input.hasOwnProperty(key)) continue;
		
		if (!(input[key] instanceof Array && input[key].length)) continue;
		
		input[key].forEach(writeLine);
	}
	
	return csvOut;
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
	});
	
	if (basCLI.die)
		process.exit(1);
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
				"message":		assertionError.message,
				"selector":		assertionError.selector,
				"nodePath":		assertionError.nodePath,
				"node":			assertionError.node,
				"annotations":	assertionError.annotations,
				"subject":		assertionError.subject,
				"component":	assertionError.component,
				"actual":		assertionError.actual
			});
		});
	}
});


function printReport() {
	
	console.error("\nTest batch completed. (%d requests)",pagesTested);
	
	if (errorCount) {
		console.error("%d assertion failures encountered over batch.".red,errorCount);
	} else {
		console.error("No assertion failures encountered over batch.".green);
	}
	
	if (!basCLI.json && !basCLI.csv) {
		
		var pageErrors = [];
		
		var outputError = function(error) {
			console.error("\n\t\t✘ ".red + String(error.message).red);
			
			if (error.annotations.length) {
				console.error("\t\t\t" +
					error.annotations.join("\n\t\t\t").bold);
			}
			
			if (error.selector) {
				console.error("\t\t\t\tSelector: " +
								String(error.selector).yellow);
			}
			
			if (error.node) {
				console.error("\t\t\t\tNode: " +
								String(error.node).cyan);
			}
			
			if (error.nodePath) {
				console.error("\t\t\t\tNode Path: " +
								String(error.nodePath).yellow);
			}
		};
		
		for (var idx in errorBatch) {
			if (!errorBatch.hasOwnProperty(idx))
				continue;
			
			pageErrors = errorBatch[idx];
			
			console.error("\n\nFailures for " + idx.blue.bold + "\n");
			console.error("\t%d failed assertions: ".red,pageErrors.length);
			
			pageErrors.forEach(outputError);
		}
	
	} else if (basCLI.csv) {
		
		process.stdout.write(jsonToCSV(errorBatch));
		
	} else {
		
		// Just serialise the whole thing and spit it out.
		process.stdout.write(JSON.stringify(errorBatch,null,2));
		
	}
	
	process.exit(errorCount);
}

process.on("SIGINT",printReport);