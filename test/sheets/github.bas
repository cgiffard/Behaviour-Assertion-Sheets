@all {
	
	title: /github/i, length(41);
	
	title {
		text: length(41);
	}
	
	h1 {
		required: true;
	}
	
	img {
		attribute(alt): true;
		count: 3;
	}
	
	img[src*="akamai"] {
		required: true;
		count: 3;
	}
}

/*@ Tests to run on pages with github in the title and on the domain github.com */
@page (title =~ /github/i) (domain = github.com) {
	
	
	
}