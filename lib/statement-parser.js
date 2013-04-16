// Parser for statements in assertions
// Separated so the syntax can eventually be unified with conditions

var operators = require("./operators"),
	barewords = require("./barewords");

// Now process the actual assertion...
// Set up some rules for parsing:
var groupingChars = {
	"[": "]",
	"(": ")",
	"'": "'",
	"\"": "\"",
	"/": "/"
};

module.exports = function(parseStatement) {
	var statementComponents = [],
		groupDepthTracking = {},
		parseBuffer = "",
		pointer = 0,
		character = "",
		prevChar = "";
	
	function isEnclosed() {
		for (var token in groupDepthTracking)
			if (!!groupDepthTracking[token])
				return true;
		return false;
	}
	
	function trackGrouping(char,prev) {
		if (groupingChars[char] && prev !== "\\") {
			// If this is a string delimiter or something that ends with the
			// same token it starts with, nesting is not permitted. We just
			// flip whether we're enclosed or not.
			if (groupingChars[char] === char) {
				groupDepthTracking[char] = 
					groupDepthTracking[char] ? 0 : 1;
			} else {
				groupDepthTracking[char] =
					groupDepthTracking[char] ?
						groupDepthTracking[char] + 1 : 1;
			}
		}
	}
	
	while (pointer < parseStatement.length) {
		character = parseStatement.substr(pointer,1);
		prevChar = parseStatement.substr(pointer-1,1);
		pointer ++;
	
		if (character.match(/[\s\,]/)) {
			if (!isEnclosed()) {
				if (parseBuffer.length)
					statementComponents.push(parseBuffer);
	
				parseBuffer = "";
				continue;
			}
		}
	
		trackGrouping(character,prevChar);
		parseBuffer += character;
	}
	
	if (parseBuffer.length)
		statementComponents.push(parseBuffer);
		
	return statementComponents;
};