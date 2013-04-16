
/*@ Page selected by regex */
@page (url =~ /^\/user\/[0-9]+/i) {
	
	h1 {
		count: 1;
		exists: true;
		contains: "My site";
	}
	
	h1 + .logo {
		has-attribute: "user-id";
		attribute-value(user-id): exists, greater-than(1);
	}
	
	
	* {
		
	}
}

/*@ Page that contains a list, according to the title */
@page (title =~ /^List of/i) {
	
	input:focus {
		
		input:focus + label {
			has-attribute: "selected";
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
		has-attribute: "alt";
		attribute-value(alt): /.+/i;
	}
}