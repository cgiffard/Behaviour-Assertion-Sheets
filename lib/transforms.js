// Transforms for test values

var TextStatistics	= require("text-statistics");

module.exports = {};

// Load in text-statistics functions
[	"flesch-kincaid-reading-ease",
	"flesch-kincaid-grade-level",
	"gunning-fog-score",
	"coleman-liau-index",
	"smog-index",
	"automated-readability-index",
	"letter-count",
	"sentence-count",
	"word-count",
	"average-words-per-sentence",
	"average-syllables-per-word"	]
		.forEach(function(basFuncName) {

			var camelFuncName =
				basFuncName
					.replace(/(-[a-z])/ig,function(input) {
						return input.substr(1).toUpperCase();
					});


			module.exports[basFuncName] =
				function(documentState,lastValue) {
					var textStats =
						new TextStatistics(String(lastValue||""));
					
					return textStats[camelFuncName]();
				};
		});