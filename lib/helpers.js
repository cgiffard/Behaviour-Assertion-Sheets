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
	}

};