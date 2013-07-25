@page (content-type =~ /^text\/html/i) (status-code = 200) {
	
	/*@ Check for bad dates */
	text: !/1 January\,* 1970/ig;
	
	/*@ Content region */
	#content {
		
		/*@ Text accessibility requirements */
		text.flesch-kincaid-grade-level: lte(9);
		
		/*@ Image alt-text requirements */
		$this img {
			attribute(alt): required, longer-than(5), shorter-than(80);
			attribute(alt).flesch-kincaid-grade-level: lte(9);
		}
		
		/*@ Table semantics */
		$this table {
			
			attribute(summary): required;
			
			$node table thead {
				required: true;
			}
			
		}
		
		/*@ Banned (invalid) attributes */
		$this * {
			attribute(align): forbidden;
			attribute(alink): forbidden;
			attribute(background): forbidden;
			attribute(bgcolor): forbidden;
			attribute(border): forbidden;
			/*@ Do not set colour or style using HTML. */
			attribute(color): forbidden;
			attribute(compact): forbidden;
			attribute(face): forbidden;
			attribute(hspace): forbidden;
			attribute(language): forbidden;
			attribute(link): forbidden;
			attribute(noshade): forbidden;
			attribute(nowrap): forbidden;
			attribute(start): forbidden;
			/*@ Do not set colour or style using HTML. */
			attribute(style): forbidden;
			attribute(text): forbidden;
			attribute(version): forbidden;
			attribute(vlink): forbidden;
			attribute(vspace): forbidden;
		}
		
		/*@ Banned table attributes */
		$this table,
		$this table * {
			attribute(width): forbidden;
			attribute(height): forbidden;
		}
		
		/*@ At least one header section must be present in each table */
		$this table {
			$this th,
			$this thead {
				required: true;
			}
		}
		
		/*@ Banned plugins in content */
		$this object,
		$this embed,
		$this iframe {
			required: forbidden;
		}
		
		/*	Can't think of a good reason to have unsemantic tags or style
			related crap in content. */
		
		/*@ Style or behavior in content */
		$this link,
		$this style,
		$this script {
			required: forbidden;
		}
		
		/* Spans which do not serve a specific purpose */
		/*@ Unsemantic tag */
		$this span:not([class]) {
			required: forbidden;
		}
		
		/* Divs which do not serve a specific purpose */
		/*@ Unsemantic tag */
		$this div:not([id]):not([itemprop]):not([itemscope]):not([class]) {
			required: forbidden;
		}
		
		/* Person Divs */
		/*@ Person */
		$this div.person {
			has-attribute(itemscope): true;
			attribute(itemscope).length: 0;
			attribute(itemtype): "http://schema.org/Person";
			
			/*@ Person images */
			$node img {
				has-attribute(itemprop): required;
				attribute(itemprop): "image";
			}
			
			/*@ Person name */
			$node h3,
			$node h2 {
				required: true;
				has-attribute(itemprop): required;
				attribute(itemprop): "name";
			}
		}
		
		/* You shouldn't be using two BRs in a row. Use a damn paragraph. */
		/*@ Unsemantic and improper use of line breaks */
		$this br + br {
			required: forbidden;
		}
		
		/* Old stuff from HTML */
		/*@ Deprecated and invalid HTML tags */
		$this font,
		$this applet,
		$this basefont,
		$this center,
		$this dir,
		$this i,
		$this b,
		$this layer {
			required: forbidden;
		}
		
		/* JavaScript & file links */
		/*@ Banned JavaScript or file links in attribute */
		$this * {
			attribute(href): !/javascript\:/ig !/file\:/ig;
			attribute(src): !/javascript\:/ig !/file\:/ig;
		}
		
		/* Links */
		/*@ Links must not open in a new window (accessibility) */
		$this a {
			attribute(target): forbidden;
		}
		
		/* Reasonable limits on nesting depth */
		/*@ Bad nesting (malformed document) */
		$this * {
			depth: lte(20);
		}
		
		/*@ Malformed ID attribute */
		$this [id] {
			attribute(id): /^[a-z][a-z0-9\-]*$/i;
			
			/*@ Duplicate ID attribute */
			[id=$(attribute(id))$] {
				count: 1;
			}
		}
		
		/*@ Malformed Class attribute */
		$this [class] {
			attribute(class): /^[a-z0-9\-\_\s]*$/i;
		}
		
		/*@ Title must not be present on elements with alt text */
		$this [alt] {
			has-attribute(title): forbidden;
		}
		
		/* We've gotta have a title on inputs if a label isn't present, and visa versa */
		/*@ Form fields without label must have a title */
		$this input:not([id]):not([type=hidden]) {
			attribute(title): required;
		}
		
		/*@ Form fields without title must have a label */
		$this input:not([title]):not([type=hidden]):not([type=submit]):not([type=text]),
		$this textarea:not([title]),
		$this select:not([title]) {
			
			attribute(id): required;
			
			/*@ Form fields without title must have a label */
			label[for=$(attribute(id))$] {
				required: true;
			}
		}
	}
}