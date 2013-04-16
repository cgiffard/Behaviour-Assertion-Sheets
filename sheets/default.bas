@page (content-type =~ /^text\/html/i) {
	
	h1 {
		required: true;
		text: longer-than(1);
		text: longer-than(512);
	}
	
	img {
		attribute(alt): required;
		attribute(alt): longer-than(1);
	}
	
}