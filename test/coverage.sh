#!/bin/sh

istanbul instrument lib -o lib-conv --no-compact &&
	mv lib lib-uncov &&
	mv lib-conv lib &&
	mocha -R mocha-istanbul -t 10000 &&
	rm -rf lib &&
	mv lib-unconv lib;