
/*@ Page selected by regex */
@page url(/^\/user\/[0-9]+/i) || title(User Details) {
	
	h1 {
		count: 1;
		exists: true;
		contains: "My site";
	}
	
	h1 + .logo {
		has-attribute: "user-id";
		attribute-value::user-id: exists, greater-than(1);
	}
	
	
	* {
		
	}
}

/*@ Page that contains a list, according to the title */
@page title(/^List of/i) || crunchy(cereal) {
	
	input:focus {
		
		input:focus + label {
			has-attribute: "selected";
		}
		
	}
	
}

/*@ Validate every page and set up some sensible expectations */
@all {
	
	validate-html: 5;
	
	
}