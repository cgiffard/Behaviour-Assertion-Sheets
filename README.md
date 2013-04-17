# Behaviour Assertion Sheets

Behaviour Assertion Sheets (Bas, pronounced 'base') are a way to describe how a
web page fits together, make assertions about its structure and content, and be
notified when these expectations are not met.

You could:

*	Use BAS to monitor the Apple Developer site to tell you when WWDC tickets
	are on sale, or your local postal service to tell you when a package has been
	delivered
*	Scan your site for common accessibility pitfalls, such as missing alt tags
	on images, poor heading order, etc.
*	Monitor for service availability and downtime
*	Integration testing and integrity verification (plug Bas into jenkins or travis!)
*	Use BAS inside of an existing test framework like Mocha to verify output,
	or even as reporting middleware inside your express application

Anybody who has ever used CSS can use Bas - the [syntax is easy and familiar.]
(#sheet-syntax)

## Installing

This first implementation of Bas is built with [node.js](http://nodejs.org), so
you'll need it and npm first. Then just use npm to install Bas:

	npm install -g bas
	
Installing globally (`-g`) makes a [CLI tool](#bas-on-the-command-line) available
for working with Bas sheets. If you don't install globally you can still use Bas
via the [node.js API](#bas-nodejs-api).

## Sheet Syntax

As mentioned earlier, the Bas syntax looks very similar to (and nearly even parses as)
CSS. Here are the major components:

![Major components of the Bas syntax, as described by the list below.]
(http://cgiffard.com/github/bas/bas-diagram.png)



### Bas Example

```css
	@page (title =~ /github/i) (domain = github.com) {
		
		status-code: 200;
		
		img[src*="akamai"] {
			required: true;
			attribute(alt): true;
			count: 3;
		}
		
		/*@ Require a heading 1 to be present if there's a heading 2 */
		h2 {
			h1 {
				required: true;
			}
		}
	}
	
	@all {
		status-code: lt(500);
	}
```

This example provides a fairly broad look at what Bas can do and how it works.

Let's break this example down bit by bit.

Given a page from the domain `github.com`, with a document title that matches the
regular expression `/github/i`:

*	Bas will check that the status code of the page matches the asserted `200 OK`.
*	Bas will select all images with `akamai` somewhere in the in the `src`
	attribute, and:
	*	Assert that at least one appears on the page
	*	Assert that each has an `alt` attribute
	*	Assert that exactly three should appear on the page if the selector matches
*	Bas will select every heading 2 (h2) on the page
	*	If there's at least one heading two on the page, Bas will select
		every heading 1 (h1), and:
			*	Assert that if a heading 2 is present, at least one heading 1
				should also be present on the page.

Then, on every page tested, Bas will check to see whether the status code of the
response was less than 500. 



## Bas on the Command Line

## Bas Node.js API

## Roadmap

#### Next Version

*	Asynchronous test support
*	Comprehensive test suite
*	Very solid cleanup

## Testing

Bas does not have an enormous test suite at this stage, but I'm working on filling
it out as comprehensively as possible.

To run the test suite, use:

	npm test

## Licence

Copyright (c) 2012, Christopher Giffard.

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, 
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR 
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.