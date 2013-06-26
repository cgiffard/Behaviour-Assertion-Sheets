/* Only for parsing tests — not for running. */

@all {
	/* Testing for a known problem with escape sequences */
	selector {
		test: /a\/(b)/;
	}
	
	otherselector {
		test: /^(\d{2})?:?(\d{2}):(\d{2})\.(\d+)\,(\d{2})?:?(\d{2}):(\d{2})\.(\d+)\s*(.*)/;
		test: /(<\/?[^>]+>)/ig;
	}
}