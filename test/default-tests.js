var cheerio = require("cheerio"),
	chai = require("chai");
	chai.should();

describe("Default assertion test",function() {

	var tests = require("../lib/tests.js");

	describe("title",function() {
		it("should return the title of the document",function() {
			var documentState = {
				"document": cheerio.load("<html><title>Example title to extract</title></html>")
			};
			
			tests.title(documentState)
				.should.equal("Example title to extract");
		});
	});
	
	describe("url",function() {
		it("should return the url of the document",function() {
			var documentState = {
				"url": "http://test.com:3000/fish?stuff=otherstuff"
			};
			
			tests.url(documentState)
				.should.equal(documentState.url);
		});
	});
	
	describe("domain",function() {
		it("should return domain component from the url of the document",function() {
			var documentState = {
				"url": "http://test.com:3000/fish?stuff=otherstuff"
			};
			
			tests.domain(documentState)
				.should.equal("test.com");
		});
	});
	
	describe("protocol",function() {
		it("should return protocol component from the url of the document",function() {
			var documentState = {
				"url": "http://test.com:3000/fish?stuff=otherstuff"
			};
			
			tests.protocol(documentState)
				.should.equal("http");
		});
	});
	
	describe("port",function() {
		it("should return port component from the url of the document",function() {
			var documentState = {
				"url": "http://test.com:3000/fish?stuff=otherstuff"
			};
			
			tests.port(documentState)
				.should.equal(3000);
		});
	});

	describe("path",function() {
		it("should return path component from the url of the document",function() {
			var documentState = {
				"url": "http://test.com:3000/fish?stuff=otherstuff"
			};
			
			tests.path(documentState)
				.should.equal("/fish?stuff=otherstuff");
		});
	});
	
	describe("pathname",function() {
		it("should return path component (sans querystring) from the url of the document",function() {
			var documentState = {
				"url": "http://test.com:3000/fish?stuff=otherstuff"
			};
			
			tests.pathname(documentState)
				.should.equal("/fish");
		});
	});
	
	describe("query",function() {
		it("should return querystring component from the url of the document",function() {
			var documentState = {
				"url": "http://test.com:3000/fish?stuff=otherstuff"
			};
			
			tests.query(documentState)
				.should.equal("stuff=otherstuff");
		});
	});
	
	describe("status-code",function() {
		it("should return status-code of the request associated with the document",function() {
			var documentState = {
				res: {
					"statusCode": 12345
				}
			};
			
			tests["status-code"](documentState)
				.should.equal(12345);
		});
	});
	
	describe("content-length",function() {
		it("should return the content length of the request associated with the document",function() {
			var documentState = {
				res: {
					headers: {
						"content-length": 12345
					}
				}
			};
			
			tests["content-length"](documentState)
				.should.equal(12345);
		});
	});
	
	describe("content-type",function() {
		it("should return the content type header from the request associated with the document",function() {
			var documentState = {
				res: {
					headers: {
						"content-type": "application/xml+imaginary-format"
					}
				}
			};
			
			tests["content-type"](documentState)
				.should.equal("application/xml+imaginary-format");
		});
	});
	
	describe("header",function() {
		it("should return the value of the specified header from the request associated with the document",function() {
			var documentState = {
				res: {
					headers: {
						"x-arbitrary-header": "You got me! Guess the jig is up.",
						"header2": "And now for something completely different."
					}
				}
			};
			
			tests.header(documentState,"x-arbitrary-header")
				.should.equal("You got me! Guess the jig is up.");
				
			tests.header(documentState,"header2")
				.should.equal("And now for something completely different.");
			
			chai.expect(tests.header(documentState,"nonexistent-header"))
				.to.be.undefined;
			
		});
	});
	
	describe("body",function() {
		it("should return the body of the requested resource as a string.",function() {
			var documentState = {
				"data": "ABC123"
			};
			
			tests.body(documentState)
				.should.equal("ABC123");
		});
	});
	
	describe("Node specific tests",function() {
		
		describe("required",function() {
			it("should return true if the node is present",function() {
				var documentState = {
					"document": cheerio.load("<html><title>Example title to extract</title></html>")
				};
				
				var node = documentState.document("title").eq(0);
				
				tests.required(documentState,node)
					.should.equal(true);
			});
		});
		
		describe("text",function() {
			it("should return the text of the given node",function() {
				var documentState = {
					"document": cheerio.load("<html><title>Example title to extract</title></html>")
				};
				
				var node = documentState.document("title").eq(0);
				
				tests.text(documentState,node)
					.should.equal("Example title to extract");
			});
		});
		
		describe("html",function() {
			it("should return the inner html source of the given node",function() {
				var documentState = {
					"document": cheerio.load("<html><title><strong><em>Example title</em> to extract</strong></title></html>")
				};
				
				var node = documentState.document("title").eq(0);
				
				tests.html(documentState,node)
					.should.equal("<strong><em>Example title</em> to extract</strong>");
			});
		});
		
		describe("attribute",function() {
			it("should return the attribute value for a given attribute of a given node",function() {
				var documentState = {
					"document": cheerio.load("<html lang=en><title>Example title to extract</title></html>")
				};
				
				var node = documentState.document("html").eq(0);
				
				// Successful attribute extraction
				tests.attribute(documentState,node,"lang")
					.should.equal("en");
				
				// Should throw error if we don't get an attribute name to check
				chai.expect(function() {
						tests.attribute(documentState,node)
					}).to.throw(Error);
				
				// Should return false if we don't have a node
				tests.attribute(documentState,null,"test")
					.should.be.false;
				
				// Should return false if this node doesn't have the attribute asked for...
				tests.attribute(documentState,node,"test")
					.should.be.false;
			});
		});
		
		describe("has-attribute",function() {
			it("should return whether an attribute is present for a given node",function() {
				var documentState = {
					"document": cheerio.load("<html lang='en' test=''></html>")
				};
				
				var node = documentState.document("html").eq(0);
				
				tests["has-attribute"](documentState,node,"lang")
					.should.be.true;
				
				tests["has-attribute"](documentState,node,"test")
					.should.be.true;
					
				tests["has-attribute"](documentState,node,"missing")
					.should.be.false;
				
				// Should throw error if we don't get an attribute name to check
				chai.expect(function() {
						tests["has-attribute"](documentState,node)
					}).to.throw(Error);
			});
		});
		
		describe("depth",function() {
			it("should properly return the nesting depth of a given node",function() {
				var documentState = {
					"document": cheerio.load("<html><div><div><div><div><span></span></div></div></div></div></html>")
				};
				
				var node = documentState.document("span").eq(0);
				
				tests.depth(documentState,node)
					.should.equal(6);
				
				// Should return false if we don't get a node
				tests.depth(documentState)
					.should.be.false;
			});
		});
		
		describe("count",function() {
			it("should return the number of nodes matched by a given selector",function() {
				var documentState = {
					"selectionLength": 20
				};
				
				tests.count(documentState)
					.should.equal(20);
				
				tests.count({})
					.should.equal(0);
			});
		});
	});
});