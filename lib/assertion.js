// Assertion definition

var parseStatement	= require("./statement-parser"),
	barewords		= require("./barewords"),
	operators		= require("./operators"),
	transforms		= require("./transforms"),
	helpers			= require("./helpers"),
	AssertionError	= require("./assertion-error");

var Assertion = function(rule) {
	this.annotations		= [];
	this.position			= rule.position;
	this.parent				= null;
	
	var self				= this;

	var rawSubject			= rule.property,
		rawAssertion		= rule.value;

	// Parse the assertion
	var subjectParts		= rawSubject.split(/\./),
		subjectFirstChunk	= subjectParts.slice(0,1).shift(),
		subjectParsed		= parseStatement.parseArguments(subjectFirstChunk),
		subject				= subjectParsed.shift(),
		args				= subjectParsed,
		transforms			= subjectParts.slice(1),
		assertions			= [];
	
	// Process arguments for transforms...
	transforms =
		transforms.map(parseStatement.parseArguments);
	
	// Trip spacing from args...
	args =
		args
		.filter(function(arg) {
			return !!arg.length;
		});

	// Process the raw assertion string into individual components
	assertions = parseStatement(rawAssertion);
	
	// Now process the individual assertion components!
	assertions = assertions.map(generateAssertion);

	// Function for generating assertions...
	function generateAssertion(component) {
		var regex,
			cleanComp,
			bwComponents,
			bareword,
			bwArgs;
		
		if (component.match(/^["'].*["']$/)) {

			// Simple string match.
			// Clean off the string delimiters before comparing...

			cleanComp =
				component
					.replace(/^["']/,"")
					.replace(/["']$/,"");

			return function StringMatch(input) {
				var result = input == cleanComp;

				if (!result) throw new AssertionError(self,component,input);
			};

		} else if (component.match(/^[\d\.]+$/)) {

			// Simple numeric match. (treat as float)

			return function NumericMatch(input) {
				var result = parseFloat(input) == parseFloat(component);

				if (!result) throw new AssertionError(self,component,input);
			};

		} else if (component.match(/^\/.*\/[a-z]*$/i)) {

			// Regular expression.
			
			regex =
				new RegExp(
					helpers.cleanRE(component),
					helpers.reParams(component));
			
			return function Regex(input) {
				var result = regex.exec(input);
				
				if (!result) throw new AssertionError(self,component,input);
			};

		} else if (component.match(/^\!\/.*\/[a-z]*$/i)) {

			// Negated regular expression.
			
			// Pull the exclamation mark off the front...
			component = component.substr(1);
			
			regex =
				new RegExp(
					helpers.cleanRE(component),
					helpers.reParams(component));

			return function NegatedRegex(input) {
				var result = !regex.exec(input);
				
				if (!result) throw new AssertionError(self,component,input);
			};

		} else if (component.match(/^[a-z0-9]+.*[\)]*$/)) {

			// Bareword or bareword function call.

			cleanComp		= component.replace(/\)$/,"");
			bwComponents	= cleanComp.split(/\(/);
			bareword		= bwComponents.slice(0,1);
			bwArgs			= bwComponents.slice(1).join(")");

			if (!barewords[bareword])
				throw new Error("Unknown assertion bareword: " + bareword);

			// Parse the arguments using the same algorithm.
			bwArgs = parseStatement(bwArgs);

			return function Bareword(input) {
				var result =
						barewords[bareword]
							.apply(null,[input].concat(bwArgs));

				if (!result) throw new AssertionError(self,component,input);
			};

		} else if (component.match(/^\![a-z0-9]+.*[\)]*$/)) {
			
			// Negated bareword or bareword function call.
			
			cleanComp		= component.replace(/\)$/,"").replace(/^\!/,"");
			bwComponents	= cleanComp.split(/\(/);
			bareword		= bwComponents.slice(0,1);
			bwArgs			= bwComponents.slice(1).join(")");
		
			if (!barewords[bareword])
				throw new Error("Unknown assertion bareword: " + bareword);
				
			// Parse the arguments using the same algorithm.
			bwArgs = parseStatement(bwArgs);
			
			return function NegatedBareword(input) {
				var result =
						!barewords[bareword]
							.apply(null,[input].concat(bwArgs));
				
				if (!result) throw new AssertionError(self,component,input);
			};
		 
		}

		// Fall through to error.
		throw new Error(
			"Could not parse assertion component:" + component);
	}

	var assertion = function(testResult,returnErrors,url,node,selector) {
		var errorList = [];

		assertions.forEach(function(assertion) {
			try {
				assertion(testResult);
			} catch(e) {

				// Save our the URL and node path if available so we can track
				// down where this error came from later!
				if (!!node)		e.addNode(node);
				if (!!url)		e.url = url;
				if (!!selector)	e.selector = selector;

				errorList.push(e);
			}
		});
		
		if (returnErrors)
			return errorList;

		return !errorList.length;
	};
	
	// Expose assertion components
	assertion.components = assertions;
	
	// Assign final values to object
	this.assertion		= assertion;
	this.rawAssertion	= rawAssertion;
	this.rawSubject		= rawSubject;
	this.subject		= subject;
	this.transforms		= transforms;
	this.args			= args;
};

Assertion.prototype.test =
	function(documentState,tests,node,returnErrors,selector) {

	if (!documentState || !tests)
		throw new Error("You must supply both documentState and a test map.");

	if (!tests[this.subject])
		throw new Error("Test '" + this.subject + "' not found in map.");

	var url = documentState.url;
	
	// Test the parameter in question.
	var testResult =
		tests[this.subject]
			.apply(
				tests[this.subject],
				[documentState,node].concat(this.args));
	
	// If there's transforms set on this assertion, we get the initial
	// test result, and transform it
	if (this.transforms && this.transforms.length) {
		
		// Loop through each transformation.
		this.transforms.forEach(function(transformDefinition) {
			
			var transformName = transformDefinition[0],
				transformArgs = transformDefinition.slice(1);
			
			if (!transforms[transformName])
				throw new Error(
					"Transformation '" + transformName + "' not found in map.");
			
			testResult =
				transforms[transformName]
					.apply(
						transforms[transformName],
						[documentState,testResult].concat(transformArgs));
		});
	}

	// Now compare it against the assertion!
	return this.assertion(testResult,!!returnErrors,url,node,selector);
};

Assertion.prototype.toError = function(documentState,tests,node,selector) {
	if (!documentState || !tests)
		throw new Error("You must supply both documentState and a test map.");

	return this.test(documentState,tests,node,true,selector);
};

Assertion.prototype.addAnnotation = function(input) {

	input =
		input
			.replace(/^\/\*\@\s*/i,"")
			.replace(/\s*\*\//i,"")
			.replace(/[\n\r]+/," ");

	this.annotations.push(input);
};

Assertion.prototype.getAnnotationTree = function() {
	
	if (this._annotationTree)
		return this._annotationTree;
	
	var annotations = [],
		objectPointer = this,
		depth = 0;
	
	do {
		if (objectPointer.annotations && objectPointer.annotations.length)
			annotations = annotations.concat(objectPointer.annotations);
		
		depth ++;
		
	} while ((objectPointer = objectPointer.parent) && depth < 5);
	
	this._annotationTree = annotations;
	return annotations;
};

Assertion.prototype.describe = function() {
	return [this.subject, this.args, this.transforms, this.rawAssertion];
};

Assertion.prototype.toString = function() {
	var description	= this.describe(),
		subject		= description[0],
		args		= description[1],
		transforms	= description[2],
		assertion	= description[3];

	return (
		subject + (
			args.length ? "(" + args.join(",") + ")" : ""
		) +
		(
			!transforms.length ? "" :
				"." +
				transforms.map(function(transform) {
					return transform[0] + (
						transform.length <= 1 ? "" : (
							"(" + transform.slice(1).join(",") + ")"
						)
					);
				})
				.join(".")
		) +
		": " +
		assertion
	);
};

module.exports = Assertion;