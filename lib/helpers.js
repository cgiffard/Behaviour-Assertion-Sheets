// Helper functions

module.exports = {
	
	// Clean up a string regular expression
	"cleanRE": function(re) {
		return re
			.replace(/^\//,"")
			.replace(/\/[a-z]*$/,"");
	},
	
	// Get params from a string regular expression
	"reParams": function(re) {
		var match = re.match(/\/([a-z]*)$/i);
		return match && match[1] ? match[1] : "";
	},
	
	// Removes leading and trailing whitespace,
	// and compacts inner whitespace.
	"trim": function(string) {
		// Make sure it's a string!
		string = String(string);
		
		return (
			string
				.replace(/\s+/," ")
				.replace(/^\s+/,"")
				.replace(/\s+$/,""));
	},
	
	// Gets a selector path to the given node.
	"getNodePath": function(node) {
		
		var path		= [],
			children	= [],
			tagSelector	= "",
			tagName		= "",
			tagID		= "",
			className	= "",
			attribs		= null,
			parentIndex	= null;
			
		var tagTypeFilter = function(child) {
			return child.type === "tag";
		};
		
		do {
			
			// Can't really select by non-tags. Keep going!
			if (node.type !== "tag")
				continue;
			
			tagSelector	= "";
			parentIndex	= null;
			tagName		= node.name;
			attribs		= node.attribs || {};
			tagID		= attribs.id;
			className	= attribs["class"] || "";
			className	= className.split(/\s+/g).join(".");
			
			if (tagName)	tagSelector =	tagName;
			if (tagID)		tagSelector +=	"#" + tagID;
			if (className)	tagSelector +=	"." + className;
			
			if (node.parent && node.parent.children) {
				children = node.parent.children.filter(tagTypeFilter);
				
				for (var index = 0; index < children.length; index++) {
					if (children[index] === node) {
						// Add one becuase nth-child indices start at 1
						parentIndex = (index + 1);
						break;
					}
				}
			}
			
			// No point polluting selector with parentindex if we have something
			// better.
			if (parentIndex !== null && !tagID)
				tagSelector += ":nth-child(" + parentIndex + ")";
			
			path.push(tagSelector);
			
			// Assume (perhaps naively) that if we've got an ID at this point,
			// that's enough, and theres no need to go deeper.
			if (tagID) break;
			
		} while ((node = node.parent));
		
		return path.reverse().join(" ");
	},
	
	"getReadableNode": function(node) {
		return (
			"<" +
			String(node.name||"undef").toLowerCase() +
			(Object.keys(node.attribs).length ? " " : "") +
			Object.keys(node.attribs).reduce(function(prev,cur) {
				if (prev.length) prev += " ";
				return prev += cur + "=\"" + node.attribs[cur] + "\"";
			},"") + 
			">"
		);
	}
};