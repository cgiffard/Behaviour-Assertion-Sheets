/*@ All block */
@all {
	
	/*@ Selector */
	selector1 {
		
		/*@ Assertion */
		text: "text";
		
		/*@ Nested Selector */
		nestedSelector {
			
			/*@ Nested selector assertion */
			text: "nested assertion";
		}
	}
	
	/*@ Selector 2 */
	selector2 {
		/*@ Assertion 2 */
		text: "abc123";
	}
	
	/*@ Selector 3 */
	selector3 {
		/*@ Assertion 3 */
		text: "abc123";
	}
}