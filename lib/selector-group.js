// SelectorGroup definition

var RuleList		= require("./rule-list"),
	Ruleset			= require("./rule-set"),
	parseStatement	= require("./statement-parser"),
	tests			= require("./tests"),
	transforms		= require("./transforms");

var SelectorGroup = function(parts,parentTree,root) {
	var parent =
		parentTree.parent instanceof SelectorGroup ? parentTree.parent : null;
	
	this.children		= new RuleList();
	this.assertions		= [];
	this.selector		= parts;
	this.cachedSelector	= null;
	this.annotations	= [];
	this.parentSelector	= parent;
	
	// If we contain $node or a $(...test...) node property include, we need
	// to maintain node context. Mark as such.
	this.nodeSpecific	= (
		parts.indexOf("$node") > -1 ||
		parts.filter(function(item) { return String(item).match(/\$\(/); }).length
	);
	
	// But is the selector scoped to the node? If we just need to interpolate
	// node properties, no. If we're using the $node keyword, yes.
	this.nodeScoped	= parts.indexOf("$node") > -1;
};

SelectorGroup.prototype = new Ruleset([""]);

SelectorGroup.prototype.toString = function() {
	return this.selector.join(" ");
};

SelectorGroup.prototype.getNodes = function(documentState,node) {
	
	var selector = this.compileSelector(node,documentState),
		$ = documentState.document,
		nodes;
	
	try {
		nodes = $(selector,(node && this.nodeScoped ? node : null));
	} catch(e) {
		throw new Error("Unable to execute selector '" + selector + "'");
	}
	
	return nodes;
};

SelectorGroup.prototype.compileSelector = function(node,docState,depth,tree) {
	
	if (this.cachedSelector && !depth) return this.cachedSelector;
	
	var self = this,
		structure = (tree||self.selector),
		selector = structure.map(function(listItem) {
			var parent = self.parentSelector;
		
			if (typeof listItem === "object" ||
				listItem instanceof Array) {
				
				return self.compileSelector(node,docState,depth?depth+1:1,listItem);
			}
			
			if (String(listItem).toLowerCase().trim() === "$this" &&
				parent instanceof SelectorGroup) {
				
				listItem = parent.compileSelector(node,docState);
			}
			
			if (String(listItem).match(/\$\(.+?\)\$/i)) {
				listItem =
					String(listItem)
						.replace(/\$\(.+?\)\$/g,function(whole) {
							var inner =
								whole.replace(/^\$\(/,"").replace(/\)\$$/,"");
							
							return self.calculateSubject(inner,node,docState);
						});
			}
			
			return listItem;
		
		}).join(depth ? "" : " ");
	
	if (!self.nodeSpecific && !depth)
		self.cachedSelector = selector;
	
	// Meaningless keyword. Gotta fix the behaviour of comma delimited selectors,
	// where one will be node scoped and another won't be.
	selector = selector.replace(/\$node/ig,"");
	
	return selector;
};

SelectorGroup.prototype.calculateSubject = function(rawSubject,node,docState) {
	
	var subjectParts		= rawSubject.split(/\./),
		subjectFirstChunk	= subjectParts.slice(0,1).shift(),
		subjectParsed		= parseStatement.parseArguments(subjectFirstChunk),
		subject				= subjectParsed.shift(),
		args				= subjectParsed,
		transformList		= subjectParts.slice(1);
	
	// Process arguments for transforms...
	transformList =
		transformList.map(parseStatement.parseArguments);
	
	if (args[0] && args[0] instanceof Array)
		args = args[0];
	
	// Trip spacing from args...
	args =
		args.map(function(arg) {
			if (typeof arg !== "string") return arg;
			
			return arg.replace(/^\s*/,"").replace(/\s*$/,"");
		})
		.filter(function(arg) {
			return !!arg.length;
		});
		
	// Test the parameter in question.
	var testResult =
		tests[subject]
			.apply(
				tests[subject],
				[docState,node].concat(args));
	
	// If there's transforms set on this assertion, we get the initial
	// test result, and transform it
	if (transformList && transformList.length) {
		
		// Loop through each transformation.
		transformList.forEach(function(transformDefinition) {
			
			var transformName = transformDefinition[0],
				transformArgs = transformDefinition.slice(1);
			
			if (!transforms[transformName])
				throw new Error(
					"Transformation '" + transformName + "' not found in map.");
			
			testResult =
				transforms[transformName]
					.apply(
						transforms[transformName],
						[docState,testResult].concat(transformArgs));
		});
	}
	
	return testResult;
};

SelectorGroup.prototype.isRequired = function() {
	var required = false;

	this.assertions.forEach(function(assertion) {

		// No point continuing testing if we've already found one.
		if (required) return;

		if (String(assertion.subject) === "required" ||
			String(assertion.subject) === "exists") {
			
			if (assertion.assertion(true))
				required = assertion;
		}
	});

	return required;
};

module.exports = SelectorGroup;