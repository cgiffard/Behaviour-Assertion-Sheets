var url				= require("url"),
	querystring		= require("querystring");

module.exports = {};


// Node non-specific tests

module.exports.title = function(documentState) {
	
	var $ = documentState.document,
		title = $("title");
	
	if (title.length)
		return title.text();
	
	return "";
};

module.exports.url = function(documentState) {
	return documentState.url;
};

module.exports.domain = function(documentState) {
	return url.parse(documentState.url).hostname;
};

module.exports.protocol = function(documentState) {
	var protocol = url.parse(documentState.url).protocol;
	return protocol.replace(/[^a-z0-9]/ig,"");
};

module.exports.port = function(documentState) {
	return parseInt(url.parse(documentState.url).port,10) || 80;
};

module.exports.path = function(documentState) {
	return url.parse(documentState.url).path;
};

module.exports.pathname = function(documentState) {
	return url.parse(documentState.url).pathname;
};

module.exports.query = function(documentState,paramName) {
	var query = url.parse(documentState.url).query;
	
	if (!paramName) return query;
	
	return querystring.parse(query)[paramName];
};

module.exports["status-code"] = function(documentState) {
	return documentState.res.statusCode;
};

module.exports["content-length"] = function(documentState) {
	if (!documentState.res.headers) return "";
	
	return documentState.res.headers["content-length"];
};

module.exports["content-type"] = function(documentState) {
	if (!documentState.res.headers) return "";
	
	return documentState.res.headers["content-type"];
};

module.exports.header = function(documentState,headerName) {
	return documentState.res.headers[headerName];
};

module.exports.body = function(documentState) {
	return String(documentState.data||"");
};



// Node specific tests

module.exports.required = function(documentState,node) {
	if (node) return true;

	return false;
};

// Synonym for required
module.exports.exists = module.exports.required;

module.exports.text = function(documentState,node) {
	var $ = documentState.document;
	node = $(node);
	
	if (node.text())
		return node.text();
	
	return "";
};


module.exports.html = function(documentState,node) {
	var $ = documentState.document;
	node = $(node);

	if (node.html())
		return node.html();

	return "";
};

module.exports.attribute = function(documentState,node,attribute) {
	
	if (!node) return false;
	
	node = documentState.document(node);
	
	if (!attribute) throw new Error("Attribute name required for test.");
	
	if (!node.attr(attribute)) return false;
	
	return node.attr(attribute);
};

module.exports["has-attribute"] = function(documentState,node,attribute) {
	
	if (!node) return false;
	
	node = documentState.document(node);

	if (!attribute) throw new Error("Attribute name required for test.");
	
	return (
		node.attr(attribute) !== undefined &&
		node.attr(attribute) !== null);
};

module.exports["tag-name"] = function(documentState,node) {

	if (!node) return false;

	node = documentState.document(node)[0];

	return node.name;
};

module.exports.depth = function(documentState,node) {
	if (!node) return false;
	
	var depth = 0,
		nodePointer = node[0] ? node[0] : node;
	
	do {
		if (nodePointer && nodePointer.name !== "root")
			depth ++;
	} while ((nodePointer = nodePointer.parent));
	
	return depth;
};

// Counts the number of nodes that matched a given selector.

module.exports.count = function(documentState,node,attribute) {
	return documentState.selectionLength || 0;
};