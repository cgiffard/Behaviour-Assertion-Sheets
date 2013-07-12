// SelectorGroup definition

var RuleList	= require("./rule-list"),
	Ruleset		= require("./rule-set");

var SelectorGroup = function(parts) {
	this.children		= new RuleList();
	this.assertions		= [];
	this.selector		= parts;
	this.annotations	= [];
};

SelectorGroup.prototype = new Ruleset([""]);

SelectorGroup.prototype.toString = function() {
	return this.selector.join(" ");
};

SelectorGroup.prototype.getNodes = function(documentState,parentSelector,node) {
	// Better, preprocessed selector algorithm soon.
	// For the moment this is a hack.
	
	var selector =
		(function flattenSelector(list,depth) {

			return list.map(function(listItem) {

				if (typeof listItem === "object" ||
					listItem instanceof Array) {

					return flattenSelector(listItem,depth?depth+1:1);

				}
				
				/* At the moment you can't go two deep with this. Gotta fix. */
				if (String(listItem).toLowerCase().trim() === "$this" &&
					parentSelector instanceof SelectorGroup) {
					
					listItem = flattenSelector(parentSelector.selector);
				}

				return listItem;

			}).join(depth ? "" : " ");

		})(this.selector);
	
	var $ = documentState.document,
		nodes = $(selector,node);

	return nodes;
};

SelectorGroup.prototype.isRequired = function() {
	var required = false;

	this.assertions.forEach(function(assertion) {

		// No point continuing testing if we've already found one.
		if (required) return;

		if (String(assertion.subject) === "required") {
			if (assertion.assertion(true))
				required = assertion;
		}
	});

	return required;
};

module.exports = SelectorGroup;