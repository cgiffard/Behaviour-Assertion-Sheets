@page (content-type =~ /^text\/html/i) (status-code = 200) {

/* Warning levels:
  - Notice: Something has been flagged that may be an error
  - Best Practice: Something has been found that is not best practice and should be fixed.
  - Warning WCAG(ref/s): This may be failing a particular wcag 2.0 requirement. and should be checked.
  - WCAG(ref/s): This is failing a particular wcag 2.0 requirement
*/

	/* Check for bad dates - there may be a code bug */
	/*@ Notice: epoch date found - there may be a code bug */
	text: !/1 January\,* 1970/ig;

	/*@ Best Practice: Bad spacing using non-breaking spaces */
	body: !contains("&nbsp;&nbsp;");

	/* Content region */
	#content .region-content {

		/*@ Text accessibility requirements */
		/* text.flesch-kincaid-grade-level: lte(9); */

		/* Images */
		$this img {
			/*@ Notice: Image src does not appear to be a correct, relative URL */
			attribute(src): /^(http|https|\/)/i;
		}

		/* Image alt-text requirements */
		$this img {
			/*@ WCAG(1.1.1 A): Alt tag missing */
			attribute(alt): required;
			/*@ Notice: Check alt text length & quality */
			attribute(alt): longer-than(5), shorter-than(350);
			/*@ Notice: Alt text not within readability requirements */
			/* attribute(alt).flesch-kincaid-grade-level: lte(9); */
		}

		/* Images and figure captions */
		$this figure {
			$node figcaption {
				/*@ Best Practice: figcaption should be present */
				required: true;
				/*@ Best Practice: Figcaption should have an ID to support aria-describedby */
				attribute(id): required;
			}

			$node img, $node blockquote, $node table, $node q {
				/*@ Best Practice: Image, blockquote, table or quote should be present */
				required: true;
				/*@ Best Practice: Should have an aria-describedby attribute that matches the figcaption */
				attribute(aria-describedby): required;
			}
		}

		/* ARIA attributes */
		$this [aria-describedby] {
			/*@ WCAG (1.3.1 A, 4.1.1 A, 4.1.2 A) There must be a tag with a matching ID for the aria-describedby attribute */
		  [id=$(attribute(aria-describedby))$] {
			  count: 1;
			  required: true;
		  }
		}

		/* Table semantics */
		$this table {
			/*@ WCAG (1.3.1 A) Tables must identify header cells */
			$node th, $node thead {
				required: true;
			}
		}

		/* Tables with summary atttribute */
		$this table[summary] {
			/*@ Notice: Value of table summary appears invalid */
			attribute(summary): longer-than(6);
			/* http://www.whatwg.org/specs/web-apps/current-work/multipage/obsolete.html#attr-table-summary */
			/*@ WCAG (4.1.1 A): Use of summary attribute on tables is obsolete */
			required: forbidden;
		}

		/* Tables without summary attribute */
		$this table:not([summary]) {
			$node caption {
				/*@ Warning WCAG(): No caption tag found on table */
				required: true;
				/*@ Notice: Value of caption tag appears too short or invalid */
				count: 1;
				text: longer-than(6);
			}
		}

		/* Banned or invalid attributes based on http://www.w3.org/TR/html5-diff/#obsolete-elements */
		$this * {
			/*@ WCAG(4.1.1): Banned or obsolete presentational attributes */
			attribute(align): forbidden;
			attribute(alink): forbidden;
			attribute(axis):forbidden;
			attribute(background): forbidden;
			attribute(bgcolor): forbidden;
			attribute(border): forbidden;
			attribute(cellpadding): forbidden;
			attribute(cellspacing): forbidden;
			attribute(clear): forbidden;
			attribute(width): forbidden;
			attribute(frame): forbidden;
			attribute(height): forbidden;
			attribute(color): forbidden;
			attribute(compact): forbidden;
			attribute(face): forbidden;
			attribute(hspace): forbidden;
			attribute(language): forbidden;
			attribute(link): forbidden;
			attribute(noshade): forbidden;
			attribute(nowrap): forbidden;
			attribute(rules): forbidden;
			attribute(scrolling): forbidden;
			attribute(start): forbidden;
			attribute(text): forbidden;
			attribute(version): forbidden;
			attribute(vlink): forbidden;
			attribute(vspace): forbidden;
			/* Best Practice: Inline styles should be avoided. */
			attribute(style): forbidden;
		}

		/* Specific obsolete attribute errors: */
		/*@ WCAG(4.1.1): Banned or obsolete attributes */
		$this link, $this a {
			attribute(rev): forbidden;
			attribute(charset): forbidden;
		}
		$this a {
			attribute(shape): forbidden;
			attribute(coords): forbidden;
		}
		$this img, $this iframe {
			attribute(longdesc): forbidden;
		}
		$this link {
			attribute(target): forbidden;
		}
		$this area {
			attribute(nohref): forbidden;
		}
		$this head {
			attribute(profile): forbidden;
		}
		$this html {
			attribute(version): forbidden;
		}
		$this img {
			attribute(name): forbidden;
		}
		$this meta {
			attribute(scheme): forbidden;
		}
		$this object {
			attribute(archive): forbidden;
			attribute(classid): forbidden;
			attribute(codebase): forbidden;
			attribute(codetype): forbidden;
			attribute(declare): forbidden;
			attribute(standby): forbidden;
		}
		$this param {
			attribute(valuetype): forbidden;
			attribute(type): forbidden;
		}
		$this td, $this th {
			attribute(axis): forbidden;
		}
		$this td {
			attribute(abbr): forbidden;
			attribute(scope): forbidden;
		}

		/*@ Best Practice: Banned plugins in content. */
		$this object,
		$this embed,
		$this iframe {
			required: forbidden;
		}

		/*	Can't think of a good reason to have unsemantic tags or style
			related crap in content. */
		/*@ Best Practice: Imported style or behavior found in content, please remove it */
		$this link,
		$this style,
		$this script {
			required: forbidden;
		}

		/* Spans which do not serve a specific purpose */
		/*@ Best Practice: Unecessary or unsemantic span tag */
		$this span:not([class]) {
			required: forbidden;
		}

		/* Divs which do not serve a specific purpose */
		/*@ Best Practice: Unecessary or unsemantic div tag */
		$this div:not([id]):not([itemprop]):not([itemscope]):not([class]) {
			required: forbidden;
		}

		/* Person Divs according to markup-demo-page */
		$this div.person {
			/*@ Best Practice: 'Person' markup missing schema information */
			has-attribute(itemscope): true;
			attribute(itemscope).length: 0;
			attribute(itemtype): "http://schema.org/Person";

			/* Person images */
			$node img {
				/*@ Best Practice: 'Person' image markup missing schema information */
				has-attribute(itemprop): required;
				attribute(itemprop): "image";
			}

			/* Person name */
			$node h3,
			$node h2 {
				/*@ Best Practice: 'Person' name markup missing schema information */
				required: true;
				has-attribute(itemprop): required;
				attribute(itemprop): "name";
			}
		}

		/* Unsemantic and improper use of line breaks */
		/*@ WCAG (4.1.1 A): Line breaks used for presentation or layout. Use paragraphs instead. */
		$this br + br {
			required: forbidden;
		}

		/* Make sure we don;t have an empy p tag or a p tag with just a entity in it (looking for &nbsp;) */
		/*@ Warning WCAG (4.1.1 A)/Best Practice: Paragraph appears to be empty or too short to be meaningful. Consider revising it. */
		$this p {
			text: longer-than(6), /\S/;
		}

		/* Headings */
		$this h1,
		$this h2,
		$this h3,
		$this h4,
		$this h5,
		$this h6 {
			/*@ WCAG (4.1.1 A)/Best Practice: Invalid markup - invalid or not recommended tag found inside a heading tag. */
			$node h1,
			$node h2,
			$node h3,
			$node h4,
			$node h5,
			$node h6,
			$node strong,
			$node b,
			$node img {
				required: forbidden;
			}
		}

		/* Old stuff from HTML */
		/*@ WCAG (4.1.1 A): Deprecated and invalid HTML tags */
		$this font,
		$this applet,
		$this basefont,
		$this center,
		$this dir,
		$this layer {
			required: forbidden;
		}

		/*@ Warning WCAG (4.1.1 A): Uncommon or deprecated HTML tags. Consider if these tags are appropriate. */
		$this i,
		$this b {
			required: forbidden;
		}


		/* JavaScript & file links */
		/*@ Best Practice: Banned JavaScript or file links found in an attribute value */
		$this * {
			attribute(href): !/javascript\:/ig !/file\:/ig;
			attribute(src): !/javascript\:/ig !/file\:/ig;
		}

		/* Links */
		/* exclude pager links which are less than 6 chars long or taxonomy term links */
		$this a:not(ul.pager a):not(.field-type-taxonomy-term-reference a) {
			/*@ Warning WCAG(3.2.5 AAA)/Best Practice: Links should not open in a new window  */
			attribute(target): forbidden;
			/*@ WCAG(4.1.1 A): Obsolete name attribute found. Use id instead. */
			attribute(name): forbidden;
			/*@ Warning WCAG(2.4.4 A, 2.4.9 AAA): Link text seems too short. Ensure the link makes sense in context (A) AND out of context (AAA) */
			html: longer-than(6);
		}

		/* Anchors */
		$this a[href^="#"]{
			/* $(attribute(href))$ resolves to #idname which we use as the selector for the test */
			/*@ WCAG(4.1.1 A, 4.1.2 A): There must be a tag with a matching ID for this anchor to work */
		  $(attribute(href))$ {
			  count: 1;
			  required: true;
		  }
		}

		/* Reasonable limits on nesting depth */
		/* Bad nesting (malformed document) */
		$this * {
			/*@ Notice: Deep nesting found, check closing tags. */
			depth: lte(25);
		}

		/* Malformed ID attribute */
		$this [id] {
			/*@ WCAG(4.1.2 A): Invalid id value. Must start with a letter. */
			attribute(id): /^[a-z][a-z0-9\-\_]*$/i;

			/*@ WCAG(4.1.2 A): Duplicate id attribute found. IDs must be unique. */
			[id=$(attribute(id))$] {
				count: 1;
			}
		}

		/* Malformed Class attribute */
		$this [class] {
			/*@ WCAG(4.1.2 A): invalid class value */
			attribute(class): /^[a-z0-9\-\_\s]*$/i;
		}

		/*@ WCAG(1.3.1 A, 4.1.2 A): Abbr tags must have a title */
		$this abbr {
			attribute(title): required;
		}

		/* We've gotta have a title on inputs if a label isn't present, and visa versa */
		/*@ WCAG(1.3.1 A, 4.1.2 A): Form fields without a label must have a title */
		$this input:not([id]):not([type=hidden]) {
			attribute(title): required;
		}

		$this input:not([title]):not([type=hidden]):not([type=submit]):not([type=text]),
		$this textarea:not([title]),
		$this select:not([title]) {
			/*@ WCAG(1.3.1 A, 4.1.2 A): Form fields without title must have an id with a matching label */
			attribute(id): required;

			/*@ WCAG(1.3.1 A, 4.1.2 A): Form fields without title must have a matching label */
			label[for=$(attribute(id))$] {
				required: true;
			}
		}
	}
}