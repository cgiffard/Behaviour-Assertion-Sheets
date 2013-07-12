@page (content-type =~ /^text\/html/i) {
	
	#content img {
		attribute(alt): required, longer-than(5), shorter-than(80);
	}
	
	
	#content table {
		
		attribute(summary): required;
		
		#content table thead {
			required: true;
		}
		
	}
	
	#content * {
		attribute(style): forbidden;
		attribute(alink): forbidden;
		attribute(align): forbidden;
		attribute(background): forbidden;
		attribute(bgcolor): forbidden;
		attribute(border): forbidden;
		attribute(color): forbidden;
		attribute(compact): forbidden;
		attribute(face): forbidden;
		attribute(hspace): forbidden;
		attribute(language): forbidden;
		attribute(link): forbidden;
		attribute(noshade): forbidden;
		attribute(nowrap): forbidden;
		attribute(start): forbidden;
		attribute(text): forbidden;
		attribute(version): forbidden;
		attribute(vlink): forbidden;
		attribute(vspace): forbidden;
	}
	
	td {
		attribute(width): forbidden;
	}
	
	#content object,
	#content embed {
		required: forbidden;
	}
	
	/* Can't think of a good reason to have unsemantic tags or style related in content. */
	#content link,
	#content style,
	#content script {
		required: forbidden;
	}
	
	/* Spans which do not serve a specific purpose */
	#content span:not([class]) {
		required: forbidden;
	}
	
	/* Divs which do not serve a specific purpose */
	#content div:not([id]):not([itemprop]):not([itemscope]):not([class]) {
		required: forbidden;
	}
	
	/* Person Divs */
	div.person {
		has-attribute(itemscope): true;
		attribute(itemscope).length: 0;
		attribute(itemtype): "http://schema.org/Person";
		
		$this img {
			required: true;
			has-attribute(itemprop): required;
			attribute(itemprop): "image";
		}
		
		$this h3 {
			required: true;
			has-attribute(itemprop): required;
			attribute(itemprop): "name";
		}
	}
	
	/* You shouldn't be using two BRs in a row. Use a damn paragraph. */
	#content br + br {
		required: forbidden;
	}
	
	/* Old stuff from HTML */
	#content font,
	#content applet,
	#content basefont,
	#content center,
	#content dir,
	#content i,
	#content b,
	#content layer {
		required: forbidden;
	}
	
	/* JavaScript & file links */
	#content * {
		attribute(href): !/javascript\:/ig !/file\:/ig;
		attribute(src): !/javascript\:/ig !/file\:/ig;
	}
	
	/* Links */
	#content a {
		attribute(target): forbidden;
	}
}