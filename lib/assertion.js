// Assertion definition

var parseStatement	= require("./statement-parser"),
	barewords		= require("./barewords"),
	operators		= require("./operators"),
	transforms		= require("./transforms"),
	helpers			= require("./helpers");

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
		args.map(function(arg) {
			return arg.replace(/^\s*/,"").replace(/\s*$/,"");
		})
		.filter(function(arg) {
			return !!arg.length;
		});

	// Process the raw assertion string into individual components
	assertions = parseStatement(rawAssertion);

	// Now process the individual assertion components!
	assertions = assertions.map(generateAssertion);

	// Function for generating assertions...
	function generateAssertion(component) {
		if (component.match(/^["'].*["']$/)) {

			// Simple string match.
			// Clean off the string delimiters before comparing...

			component =
				component
					.replace(/^["']/,"")
					.replace(/["']$/,"");

			return function(input) {
				var result = input == component;

				if (!result) {
					throw new Error(
						rawSubject + ": " +
						"String expectation '" + component + "' " +
						"failed to match input: '" +
						helpers.trim(input) +
						"' (" + component + ")"
					);
				}
			};

		} else if (component.match(/^[\d\.]+$/)) {

			// Simple numeric match. (treat as float)

			return function(input) {
				var result = parseFloat(input) == parseFloat(component);

				if (!result) {
					throw new Error(
						rawSubject + ": " +
						"Numeric expectation '" + component + "' " +
						"failed to match input: '" +
						helpers.trim(input) +
						"' (" + component + ")"
					);
				}
			};

		} else if (component.match(/^\/.*\/[a-z]+$/i)) {

			// Regular expression.

			return function(input) {
				var result = (
					new RegExp(
							helpers.cleanRE(component),
							helpers.reParams(component)))
								.exec(input);

				if (!result) {
					throw new Error(
						rawSubject + ": " +
						"Regular expression '" + component + "' " +
						"failed to match input: '" +
						helpers.trim(input) +
						"' (" + component + ")"
					);
				}
			};

		} else if (component.match(/^\!\/.*\/[a-z]+$/i)) {

			// Negated regular expression.

			return function(input) {
				var result = !(
					new RegExp(
							helpers.cleanRE(component),
							helpers.reParams(component)))
								.exec(input);

				if (!result) {
					throw new Error(
						rawSubject + ": " +
						"Negated regular expression '" + component + "' " +
						"failed to match input: '" +
						helpers.trim(input) +
						"' (" + component + ")"
					);
				}
			};

		} else if (component.match(/^[a-z0-9]+.*[\)]*$/)) {

			// Bareword or bareword function call.

			var cleanComp		= component.replace(/\)$/,""),
				bwComponents	= cleanComp.split(/\(/),
				bareword		= bwComponents.slice(0,1),
				bwArgs			= bwComponents.slice(1).join(")");

			if (!barewords[bareword])
				throw new Error("Unknown assertion bareword: " + bareword);

			// Parse the arguments using the same algorithm.
			bwArgs = parseStatement(bwArgs);

			return function(input) {
				var result =
						barewords[bareword]
							.apply(null,[input].concat(bwArgs));

				if (!result) {
					throw new Error(
						"'" + rawSubject + "' expects " + component + ": " +
						"Component test '" + bareword + "' failed " +
						"against input '" + helpers.trim(input) + "'."
					);
				}
			};

		}

		// Fall through to error.
		throw new Error(
			"Could not parse assertion component:" + component);
	}

	var assertion = function(testResult,returnErrors,url,nodePath,selector) {
		var errorList = [];

		assertions.forEach(function(assertion) {
			try {
				assertion(testResult);
			} catch(e) {

				// Save our the URL and node path if available so we can track
				// down where this error came from later!
				if (!!nodePath)	e.nodePath = nodePath;
				if (!!url)		e.url = url;
				if (!!selector)	e.selector = selector;
				
				e.annotations = self.getAnnotationTree();

				errorList.push(e);
			}
		});

		if (returnErrors)
			return errorList;

		return !errorList.length;
	};
	
	// Assign final values to object
	this.assertion		= assertion;
	this.rawAssertion	= rawAssertion;
	this.subject		= subject;
	this.transforms		= transforms;
	this.arguments		= args;
};

Assertion.prototype.test =
	function(documentState,tests,node,returnErrors,selector) {

	if (!documentState || !tests)
		throw new Error("You must supply both documentState and a test map.");

	if (!tests[this.subject])
		throw new Error("Test '" + this.subject + "' not found in map.");

	var url = documentState.url,
		nodePath = node ? helpers.getNodePath(node) : "";

	// Test the parameter in question.
	var testResult =
		tests[this.subject]
			.apply(
				tests[this.subject],
				[documentState,node].concat(this.arguments));
	
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
		})
	}

	// Now compare it against the assertion!
	return this.assertion(testResult,!!returnErrors,url,nodePath,selector);
};

Assertion.prototype.toError = function(documentState,tests,node,selector) {
	if (!documentState || !tests)
		throw new Error("You must supply both documentState and a test map.");

	return this.test(documentState,tests,node,true,selector);
};

Assertion.prototype.getAnnotationTree = function() {
	var annotations = [],
		objectPointer = this,
		depth = 0;
	
	do {
		if (objectPointer.annotations && objectPointer.annotations.length)
			annotations = annotations.concat(objectPointer.annotations);
		
		depth ++;
		
	} while ((objectPointer = objectPointer.parent) && depth < 5);
	
	return annotations;
};

Assertion.prototype.describe = function() {
	return [this.subject, this.arguments, this.transforms, this.rawAssertion];
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