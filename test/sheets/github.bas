@all {
	
	title: /github/i, length(43);
	
	title {
		text: length(43);
	}
	
	h1 {
		required: true;
	}
	
	video {
		required: true;
	}
	
	img {
		attribute(alt): true;
		count: 99;
	}
	
	img[src*="akamai"] {
		required: true;
		count: 99;
	}
}

/*@ Tests to run on pages with github in the title and on the domain github.com */
@page (title =~ /github/i) (domain = github.com) {
	
	
	
}