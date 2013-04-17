# Behaviour Assertion Sheets

Behaviour Assertion Sheets (Bas) are a way to describe how a web page should be
constructed, make assertions about it, and be notified when these expectations
are not met.

You could:

*	Use BAS to monitor the Apple Developer site to tell you when tickets are
	on sale
*	Scan your site for common accessibility pitfalls, such as missing alt tags
	on images, poor heading order, etc.
*	Monitor for service availability and downtime
*	Integration testing and integrity verification
*	Use BAS inside of an existing test framework like Mocha to verify output,
	or even as reporting middleware inside express

Anybody who has ever used CSS can use Bas - the syntax is easy and familiar.

## Installing

First of all you'll need to install Bas. You'll need node.js and npm first.
Then just use npm to install Bas:

	npm install -g bas
	
Installing globally (`-g`) makes a CLI tool available for working with Bas sheets.
If you don't install globally you can still use Bas via the node.js API.

## Sheet Syntax

### BAS Example

```css
	@page (title =~ /github/i) (domain = github.com) {
		
		status-code: 200;
		
		img[src*="akamai"] {
			required: true;
			attribute(alt): true;
			count: 3;
		}
	}
```





## BAS on the Command Line

## BAS Node.js API

## Roadmap

#### Next Version

*	Asynchronous test support
*	Comprehensive test suite

## Testing

BAS does not have an enormous test suite at this stage, but I'm working on filling
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