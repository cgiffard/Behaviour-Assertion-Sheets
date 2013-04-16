var url			= require("url"),
	querystring	= require("querystring");

module.exports = {};

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
	return url.parse(documentState.url).protocol || 80;
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

module.exports.attribute = function(documentState,node,attribute) {
	
	if (!node) return false;
	
	if (!node.hasAttribute(attribute)) return false;
	
	return node.attribute(attribute);
};