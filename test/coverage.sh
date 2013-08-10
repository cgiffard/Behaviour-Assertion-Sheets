#!/bin/sh

istanbul instrument lib -o lib-conv --no-compact --embed-source &&
	mv lib lib-unconv &&
	mv lib-conv lib &&
	mocha -R mocha-istanbul -i -g JSHint -g runner;

rm -rf lib && mv lib-unconv lib;

if which open &>/dev/null
then
	open html-report/index.html;
fi