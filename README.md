# Behaviour Assertion Sheets

Behaviour Assertion Sheets (Bas, pronounced 'base') are a way to describe how a
web page fits together, make assertions about its structure and content, and be
notified when these expectations are not met. It's a bit like selenium, if you've
ever used that.

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

(You can work this out yourself and just want to skip to the goods?
[Jump to syntax example.](#bas-example))

#### Rulesets

Rulesets are the highest-level construct in Bas. Everything falls inside a ruleset.
There are two kinds of rulesets - page specific rulesets denoted by the tag `@page`,
and rulesets that execute unconditionally, denoted by the tag `@all`.

Syntactically these are based on the 'at-rules' of CSS (such as `@font-face`,
`@media`, etc.)

Rulesets cannot be nested.

An example rulset:

	@all {
		...
	}

#### Annotations

Annotations are an extension of CSS comments, that are prepended with an `@` symbol.
Bas knows to associate these with rulesets and selectors that follow, and displays
them in assertion failure traces so you know where they came from!

You may add as many annotations as you like to a single element. Every annotation
that precedes a block, regardless of whether assertions or regular comments (just
normal CSS comments without an `@`) are interspersed within them, is associated
with that block.

An example annotation:

	/*@ Here's my annotation! */

#### Conditions

A condition is appended to a page-specific ruleset (`@page`) and determines based
on the response information, URL of the page, and other environment variables,
whether the current page should be evaluated against this ruleset.

Conditions are additive and exclusive - each has to be true for the page to be
considered for testing against a given ruleset. You may add as many conditions
as you like to a `@page` ruleset.

Conditions are composed of a parentheses-wrapped set of three elements, each space
separated. On the left-hand side, a `test` - a reference to a function which
returns an environment variable or extracts an aspect of the current page or
server response.

The middle is an operator, which defines how the comparison takes place. An example
of an operator might be `=` or `>=` or `!=~`. A full list of operators can be
found in the [syntax glossary](#operators).

The rightmost component is the assertion value - a string, number, or regular
expression which is compared to the test according to the rules of the operator.

An example condition:

	@page (status-code = 301) { ... }

Multiple conditions may be combined like so:

	@page (status-code = 301) (content-type != text/html) { ... }
	
Remember that adding more conditions will make the match more *exclusive*, as
every single one must succeed for the ruleset to be evaluated.

#### Assertions

An assertion is very similar to a `declaration` in CSS. Fundamentally, it is a
semicolon delimited key-value pair, that unlike CSS, defines an expectation
rather than assigning a value.

The left-hand side of the assertion is known as the [subject](#subject) of the
assertion, and refers to a [test](#tests) - a function that returns a value based
on the content of the current page/request.

This value is then compared against the right-hand side of the assertion - which
can contain any number of match requirements, separated by commas and/or spaces.
These requirements are evaluated separately, and should any single one of them
fail (return a falsy value) the assertion will be considered `failed`.

Match requirements for an assertion can be strings, numbers, regular expressions,
or (barewords)[#barewords].

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

## Syntax Glossary

### Operators

### Tests

### Barewords

## Bas on the Command Line

## Bas Node.js API

## Roadmap

#### Next Version

*	Asynchronous test support
*	Comprehensive test suite
*	Very solid cleanup

#### Further down the road

*	Support for headless browsers and PhantomJS

#### Under consideration

*	Cross compilation of Bas sheets to selenium

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