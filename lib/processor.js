// Reprocessor for csstree AST

var RuleList		= require("./rules").RuleList,
	Ruleset			= require("./rules").Ruleset,
	SelectorGroup	= require("./rules").SelectorGroup;

function processTree(tree,pointer) {
	var cTree = pointer ? pointer.children : new RuleList(),
		annotationQueue = [];

	if (!tree.branches) return cTree;
	
	tree.branches.forEach(function(branch) {
		
		if (branch.comment &&
			branch.comment.match(/^\/\*\@/ig)) {
			
			annotationQueue.push(branch.comment);
		}
		
		if (branch.atrule) {
			cTree.push(new Ruleset(branch.parts));
			
			if (annotationQueue.length) {
				annotationQueue
					.forEach(cTree.last.addAnnotation.bind(cTree.last));
				
				annotationQueue = [];
			}
		}
		
		if (branch.selector)
			cTree.push(new SelectorGroup(branch.parts));
		
		if (branch.rules)
			branch.rules
				.forEach(cTree.last.addAssertion.bind(cTree.last));
		
		if (branch.branches)
			processTree(branch,cTree.last);
		
	});

	return cTree;
}

module.exports = processTree;