var chai = require("chai");
	chai.should();

describe("Annotations",function() {
	
	var BAS = require("../"),
		testSuite = new BAS(),
		loaded	= false,
		loading = false,
		queue	= [];
	
	function loadIfNotLoaded(cb) {
		
		function go() {
			queue.forEach(function(cb) {
				loading = false;
				loaded = true;
				cb();
			});
		}
		
		if (loaded) return cb();
		
		if (loading) return queue.push(cb);
		
		loading = true;
		queue.push(cb);
		
		testSuite
			.loadSheet(__dirname + "/sheets/annotations.bas")
				.yep(go);
	}
	
	it("At-rule annotation",function(done) {
		loadIfNotLoaded(function() {
			var atrule = testSuite.rules[0];
			
			atrule.annotations.length.should.equal(1);
			atrule.annotations[0].should.equal("All block");
			
			done();
		});
	});
	
	
	it("First selector annotation",function(done) {
		loadIfNotLoaded(function() {
			var selector = testSuite.rules[0].children[0];
			
			selector.annotations.length.should.equal(1);
			selector.annotations[0].should.equal("Selector");
			
			done();
		});
	});
	
	it("First assertion annotation",function(done) {
		loadIfNotLoaded(function() {
			var assertion = testSuite.rules[0].children[0].assertions[0];
			
			assertion.annotations.length.should.equal(1);
			assertion.annotations[0].should.equal("Assertion");
			
			done();
		});
	});
	
	it("Nested selector annotation",function(done) {
		loadIfNotLoaded(function() {
			var selector = testSuite.rules[0].children[0].children[0];
			
			selector.annotations.length.should.equal(1);
			selector.annotations[0].should.equal("Nested Selector");
			
			done();
		});
	});
	
	it("Nested selector assertion annotation",function(done) {
		loadIfNotLoaded(function() {
			var assertion = testSuite.rules[0].children[0].children[0].assertions[0];
			
			assertion.annotations.length.should.equal(1);
			assertion.annotations[0].should.equal("Nested selector assertion");
			
			done();
		});
	});
	
	it("Second selector annotation",function(done) {
		loadIfNotLoaded(function() {
			var selector = testSuite.rules[0].children[1];
			
			selector.annotations.length.should.equal(1);
			selector.annotations[0].should.equal("Selector 2");
			
			done();
		});
	});
	
	it("Second selector's assertion annotation",function(done) {
		loadIfNotLoaded(function() {
			var assertion = testSuite.rules[0].children[1].assertions[0];
			
			assertion.annotations.length.should.equal(1);
			assertion.annotations[0].should.equal("Assertion 2");
			
			done();
		});
	});
	
});