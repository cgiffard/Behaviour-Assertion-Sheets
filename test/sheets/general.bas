
/*@ Page selected by regex */
@page (url =~ /^\/user\/[0-9]+/i) {
	
	h1 {
		count: 1;
		exists: true;
		text: contains("My site");
	}
	
	h1 + .logo {
		attribute(user-id): exists, gt(1);
	}
	
	
	* {
		
	}
}

/*@ Page that contains a list, according to the title */
@page (title =~ /^List of/i) {
	
	input:focus {
		
		input:focus + label {
			attribute(selected): exists;
		}
		
	}
	
}

/* content length demo 1 */
@page (content-length = 512) {
	
}

/* content length demo 2 */
@page (content-length < 512) {

}

/* content length demo 3 */
@page (content-length >= 512) {

}

/* content length demo 4 */
@page (content-length != 512) {

}

/* negation demo 1 */
@page (title !=~ /regex/ig) {
	
}

/* negation demo 2 */
@page (title != "stuff") {
	
}

/*@ Validate every page and set up some sensible expectations */
@all {
	
	validate-html: 5;
	
	img {
		attribute(alt): exists;
		attribute(alt): /.+/i;
	}
}