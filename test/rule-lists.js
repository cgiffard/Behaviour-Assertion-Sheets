var chai = require("chai");
	chai.should();
	
describe("Rule Lists",function() {
	
	var RuleList = require("../lib/rule-list");
	
	it("should be able to be created",function() {
		var list = new RuleList();
		
		list.length.should.equal(0);
		chai.expect(list.parent).to.be.null;
	});
	
	it("should return undefined on .last() for zero length lists",function() {
		var list = new RuleList();
		
		chai.expect(list.last).to.be.undefined;
	});
	
	it("should not permit appending non-rule lists",function() {
		var list = new RuleList(),
			error;
		
		try { list.append(null); }
		catch (e) { error = e; }
		
		chai.expect(error).to.be.an.instanceOf(Error);
	});
	
});