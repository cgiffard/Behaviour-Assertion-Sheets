// Tests to ensure crawler code is well formed

var chai = require("chai");
	chai.should();

describe("Core code",function() {
	var JSHINT = require("jshint").JSHINT,
		fs = require("fs");

	function readCode(file) {
		file = __dirname + "/../lib/" + file + ".js";
		return fs.readFileSync(file).toString("utf8");
	}

	[	"assertion",
		"barewords",
		"cli",
		"helpers",
		"index",
		"operators",
		"processor",
		"rule-list",
		"rule-set",
		"selector-group",
		"statement-parser",
		"tests",
		"transforms"	].forEach(function(item) {

		var code = readCode(item);

		it("module `" + item + "` should pass JSHint with no errors",function() {
			
			var jsHintGlobals = {
				// Don't want no errant logging statements going to production!
				// `console` has been deliberately omitted from this whitelist.
			
				// All the regular node stuff
				"require": true,
				"module": true,
				"process": true,
				"Buffer": true
			};
			
			// Well, the CLI uses console.
			if (item === "cli")
				jsHintGlobals.console = true;
			
			JSHINT(code,{
					"indent": 4,
					"undef": true
				},
				jsHintGlobals);

			if (JSHINT.errors.length) {
				throw new Error(
							"Line " +
							JSHINT.errors[0].line + ": " +
							JSHINT.errors[0].reason);
			}
		});

	});
});