#!/bin/sh

istanbul instrument lib -o lib-conv &&
	mv lib lib-unconv &&
	mv lib-conv lib &&
	mocha -R mocha-istanbul -t 10000 &&
	rm -rf lib &&
	mv lib-unconv lib;

if which open
then
	open html-report/index.html;
fi