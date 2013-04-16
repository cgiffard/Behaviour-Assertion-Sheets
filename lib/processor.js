// Reprocessor for csstree AST

var RuleList		= require("./rules").RuleList,
	Ruleset			= require("./rules").Ruleset,
	SelectorGroup	= require("./rules").SelectorGroup;

function processTree(tree,pointer,root) {
	var cTree = pointer ? pointer.children : new RuleList(),
		annotationQueue = [];
	
	// Only set the parent node if we haven't got one already
	root = root || cTree;

	if (!tree.branches) return cTree;
	
	tree.branches.forEach(function(branch) {
		
		if (branch.comment &&
			branch.comment.match(/^\/\*\@/ig)) {
			
			annotationQueue.push(branch.comment);
		}
		
		if (branch.atrule)
			cTree.push(new Ruleset(branch.parts,cTree,root));
		
		if (branch.selector)
			cTree.push(new SelectorGroup(branch.parts,cTree,root));
		
		// If we're not a comment block now, attach our current list of
		// annotations to the last ruleset or selector
		if (!branch.comment && annotationQueue.length && cTree.last) {
			annotationQueue
				.forEach(cTree.last.addAnnotation.bind(cTree.last));
			
			annotationQueue = [];
		}
		
		if (branch.rules)
			branch.rules
				.forEach(cTree.last.addAssertion.bind(cTree.last));
		
		if (branch.branches)
			processTree(branch,cTree.last,root);
		
	});

	return cTree;
}

module.exports = processTree;