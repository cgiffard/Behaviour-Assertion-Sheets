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

var stringDelimiters = {
	"'": "'",
	"\"": "\""
};

var regexDelimiters = {
	"/": "/"
};

var escapeSequences = {
	"\\": "\\"
};

module.exports = function(parseStatement) {
	var statementComponents = [],
		groupingStack = [],
		parseBuffer = "",
		pointer = 0,
		character = "",
		prevChar = "";
		
	if (!parseStatement)
		return;
	
	function isEnclosed() {
		return !!groupingStack.length;
	}
	
	function prevCharWasEscape() {
		// If we're the first character in the string, the last character can't
		// possibly have been an escape sequence.
		if (!pointer) return false;
		
		// If the previous character was an escape sequence but that character
		// itself was not escaped, then yes. Otherwise no.
		if (escapeSequences[parseStatement.substr(pointer-2,1)]) {
			
			if (pointer > 1 && escapeSequences[parseStatement.substr(pointer-3,1)])
				return false;
			
			return true;
		}
		
		return false;
	}
	
	function inRegularExpression() {
		return groupingStack.reduce(function(prev,cur) {
			return prev || !!regexDelimiters[cur];
		},false);
	}
	
	function trackGrouping(character,prev) {
		// If the previous character was an escape sequence, don't act
		// on anything here.
		if (prevCharWasEscape()) return;
		
		// Get whatever's atop the grouping stack (or null if there's nothing.)
		var stackTop = groupingStack[groupingStack.length-1];
		
		// This is a closing character for whatevers atop the enclosure stack
		if (groupingChars[stackTop] === character)
			return groupingStack.pop();
		
		// Only some grouping characters can directly abut text characters.
		// Regex and string delimiters are not these.
		if (prev.match(/[a-z0-9]/i)) {
			if (stringDelimiters[character])
				return false;
			
			if (regexDelimiters[character] && !inRegularExpression())
				return false;
		}
		
		// This is a new character which will add a new enclosure context.
		if (groupingChars[character] && !stringDelimiters[stackTop])
			return groupingStack.push(character);
	}
	
	while (pointer < parseStatement.length) {
		character = parseStatement.substr(pointer,1);
		prevChar = pointer > 0 ? parseStatement.substr(pointer-1,1) : "";
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
		
		// If this character is not an escape character (or if it has been
		// escaped itself) then push it into the buffer.
		if (!escapeSequences[character] || inRegularExpression() || prevCharWasEscape())
			parseBuffer += character;
	}
	
	if (parseBuffer.length)
		statementComponents.push(parseBuffer);
	
	return statementComponents;
};

// Parse a function call with arguments in brackets, then split out the arguments
// themselves.
// Not really complex-nesting-safe yet. Better to replace than to fix.
module.exports.parseArguments = function(stringInput) {
	var argParts =
		stringInput
			.split(/[\(\)]/i)
			.filter(function(input) {
				return !!input.length;
			})
			.map(function(item,count) {
				if ((item % 2))
					return module.exports(item);
				
				return item;
			});
	
	return argParts;
};