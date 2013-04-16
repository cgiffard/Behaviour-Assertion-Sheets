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

basCLI
	.version(packageInfo.version)
	.option("-c --crawl",			"Crawl from the specified URLs")
	.option("-s --sheet [filename]","Test using the specified BAS")
	.option("-l --limit [number]",	"Number of resources to request")
	.option("-d --die",				"Die on first error")
	.option("-v --verbose",			"Verbose output")
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
	
	testSuite.run(url,res,data)
		.yep(function() {
			
			// Resume crawl, if that's what we're doing.
			if (crawl) crawl.start();
			
			// And fire off our success promise.
			promises.yep();
		})
		.nope(promises.nope);
});

function startCrawl() {
	crawl = crawler.crawl(basCLI.args[0]);
	
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
	
	crawl.on("fetcherror",function(queueItem) {
		console.error(
			util.format("Unable to download '%s'.",queueItem)
				.red);
	});
	
	crawl.on("fetcherror",function(queueItem) {
		console.error(
			util.format("404: Resource missing: '%s'.",queueItem)
				.yellow);
	});
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
	console.error(("\t\t\t\t✘ Assertion failed: " + assertion).red);
	errors.forEach(function(error) {
		console.error("\t\t\t\t\t" + String(error).red);
	})
});

testSuite.on("end",function() {
	console.log("\tBAS test suite completed. Errors:");
	testSuite.errors.forEach(function(error) {
		console.error("\t\t" + String(error).red);
	});
	console.log("\n");
});


function printReport() {
	
}