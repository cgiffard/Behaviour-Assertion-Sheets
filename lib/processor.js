// Reprocessor for csstree AST

var RuleList		= require("./rule-list"),
	Ruleset			= require("./rule-set"),
	SelectorGroup	= require("./selector-group");

function processTree(tree,pointer,root) {
	var cTree = pointer ? pointer.children : new RuleList(),
		annotationQueue = [],
		last = null;
	
	if (pointer)
		pointer.children.parent = pointer;
	
	// Only set the parent node if we haven't got one already
	root = root || cTree;

	if (!tree.branches) return cTree;
	
	// Kick off tree processing
	tree.branches
	
		// Sort by position
		.sort(branchSort)
		
		// Process!
		.forEach(function(branch,index) {
			
			if (branch.comment &&
				branch.comment.match(/^\/\*\@/ig)) {
				
				return annotationQueue.push(branch.comment);
			}
			
			if (branch.rule)
				last = branch.parent.addAssertion(branch);
			
			if (branch.atrule)
				cTree.push(last = new Ruleset(branch.parts,cTree,root));
			
			if (branch.selector)
				cTree.push(last = new SelectorGroup(branch.parts,cTree,root));
			
			// If we're not a comment block now, attach our current list of
			// annotations to the last ruleset or selector
			if (!branch.comment && annotationQueue.length) {
				
				annotationQueue
					.forEach(last.addAnnotation.bind(last));
				
				annotationQueue = [];
			}
			
			var nextTree = { "branches": [] };
			
			if (branch.rules)
				nextTree.branches =
					nextTree.branches.concat(
						branch.rules.map(function(rule) {
							rule.parent = cTree.last;
							rule.rule = true;
							return rule;
						}));
			
			if (branch.branches)
				nextTree.branches =
					nextTree.branches.concat(branch.branches);
			
			if (nextTree.branches && nextTree.branches.length)
				processTree(nextTree,cTree.last,root);
			
		});
	
	return cTree;
}

function branchSort(a,b) {
	return a.position.range.start - b.position.range.start;
}

module.exports = processTree;