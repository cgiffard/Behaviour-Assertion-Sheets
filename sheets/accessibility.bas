@page (content-type =~ /^text\/html/i) {
	
	img {
		attribute(alt): required, longer-than(5), shorter-than(80);
		/* attribute(alt).flesch-kincaid-grade-level: lte(11); */
	}
	
	article * {
		attribute(style): forbidden;
	}
	
	/*@ If a heading 2 is present, a heading 1 must be */
	article h2 {
		article h1 { required: true; }
	}
	
	/*@ If a heading 3 is present, a heading 2 must be */
	article h3 {
		article h2 { required: true; }
	}
	
	/*@ If a heading 4 is present, a heading 3 must be */
	article h4 {
		article h3 { required: true; }
	}
	
	/*@ No MS word tags */
	article {
		html: !contains("mso");
	}
	
	/*@ Test Accessibility Check */
	/*h1, h2, h3, h4, h5, h6, p {
		text.flesch-kincaid-grade-level: lte(11);
	}*/
	
}