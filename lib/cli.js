#!/usr/bin/env node

var	crawler		= require("simplecrawler"),
	basCLI		= require("commander"),
	colors		= require("colors"),
	yoyaku		= require("yoyaku"),
	request		= require("request"),
	url			= require("url"),
	BAS			= require("./index"),
	packageInfo	= require("../package.json"),
	testSuite	= new BAS();

basCLI
	.version(packageInfo.version)
	.option("-c --crawl",			"Crawl from the specified URLs")
	.option("-s --sheet [filename]","Test using the specified BAS")
	.parse(process.argv);


if (!basCLI.args.length) {
	console.error("You must specify at least one URL to test against.");
}

if (basCLI.crawl) {
	startCrawl();
} else {
	
}

function handleResponse() {
	
}

function startCrawl() {
	var crawl = crawler.crawl(basCLI.args[0]);
	
	// Get all the domains out of the inputted URLs, sort, deduplicate and add
	// them to the crawler whitelist
	var domains =
		basCLI.args
		.map(function(urlString) {
			console.log(urlString);
			return String(url.parse(urlString).hostname).toLowerCase();
		})
		.sort()
		.reduce(function(prev,cur,idx,arr) {
			console.log(prev,cur);
			if (prev[prev.length-1] !== cur)
				prev.push(cur);
			console.log(prev);
			return prev;
		},[])
		.forEach(function(domain) {
			console.log(domain);
			crawl.domainWhitelist.push(domain);
		});
	
	// Now queue any URLs we still haven't put in...
	basCLI.args.forEach(crawl.queueURL.bind(crawl));
	crawl.discoverResources = false;
	crawl.on("fetchcomplete",function() {
		console.log(arguments);
	})
}

// testSuite.loadSheet(__dirname + "/test/sheets/github.bas");
// request("https://github.com/",function(err,res,body) {
// 	testSuite.run("https://github.com/",res,body);
// });



function printReport() {
	
}