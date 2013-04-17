@page (content-type =~ /^text\/html/i) {
	
	h1 {
		required: true;
		text: longer-than(1);
	}
	
	h2 {
		
		h1 {
			
			required: true;
			
		}
		
	}
	
	img {
		attribute(alt): required;
		attribute(alt): longer-than(1);
	}
	
	a {
		/* attribute(title): forbidden; */
	}
	
	/*@ Inline Styles (we don't want them!) */
	* {
		/* attribute(style): forbidden; */
	}
	
}

/* Check to see whether pages are being transferred with the correct MIME types */
@page (url =~ /\.css$/i)	{ content-type: "text/css";			}
@page (url =~ /\.js$/i)		{ content-type: "text/javascript";	}
@page (url =~ /\.mp4$/i)	{ content-type: "video/mp4";		}
@page (url =~ /\.webm$/i)	{ content-type: "video/webm";		}