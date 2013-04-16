@all {
	
	title: /github/i, length(43);
	
	h1 {
		exists: true;
	}
	
}

/*@ Tests to run on pages with github in the title and on the domain github.com */
@page (title =~ /github/i) (domain = github.com) {
	
}