@all {
	
	title: /github/i, length(41);
	
	title {
		text: length(41);
	}
	
	h1 {
		required: true;
	}
	
	img {
		attribute(alt): required;
		attribute(alt).flesch-kincaid-grade-level: lte(10);
		count: 3;
	}
	
	img[src*="akamai"] {
		required: true;
		count: 3;
	}
	
	/*@ All paragraphs */
	p {
		/*@ Paragraph text should be readable by persons with a grade 10 or higher level of education. */
		text.flesch-kincaid-grade-level: lte(10);
	}
}

/*@ Tests to run on pages with github in the title and on the domain github.com */
@page (title =~ /github/i) (domain = github.com) {
	
	
	
}