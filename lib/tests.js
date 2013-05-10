var url				= require("url"),
	querystring		= require("querystring")

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
	node = documentState.document(node);
	
	if (!attribute) throw new Error("Attribute name required for test.");
	
	if (!node) return false;
	
	if (!node.attr(attribute)) return false;
	
	return node.attr(attribute);
};

// Counts the number of nodes that matched a given selector.

module.exports.count = function(documentState,node,attribute) {
	return documentState.selectionLength || 0;
};