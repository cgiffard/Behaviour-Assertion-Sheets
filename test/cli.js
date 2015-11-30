var expect  = require("chai").expect,
    exec    = require("child_process").exec,
    http    = require("http"),
    fs      = require("fs"),
    path    = require("path");

describe("Test runner via CLI",function() {

    var httpServer;

    before(function(done) {
        httpServer = http.createServer(function(req, res) {
            console.log("--> mock: %s", req.url);

            var file = req.url === "/" ? "index.html" : req.url;

            fs.readFile(
                path.join(__dirname, "fixtures", req.url),
                function(err, data) {
                    if (err) {
                        return res.writeHead(500), res.end(err.message);
                    }

                    res.writeHead(200, { "content-type": "text/html" });
                    res.end(data);
                });
        });

        httpServer.listen(2501, done);
    });

    after(function(done) {
        httpServer.close(done);
    });

    it("should be able to be called with some defaults",function(done) {

        var command =
                path.join(__dirname, "../lib/cli.js") +
                    " -s " + __dirname + "/sheets/github.bas" +
                    " -v" +
                    " http://127.0.0.1:2501/github.html";

        console.log("Executing: %s", command);

        exec(command, function(err, stdout, stderr) {

            expect(err.code,
                "Exit code should be equal to the number of assertion errors")
                    .to.equal(7);

            expect(stderr,
                "Should contain assertion failure text")
                    .to.contain(
                        "✘ title expects 'length(41)': Component test " +
                        "'length' failed against input 'GitHub · Where " +
                        "software is built'.");

            expect(stderr,
                "Should contain more complex assertion failure text")
                    .to.contain(
                        "text.flesch-kincaid-grade-level expects 'lte(10)': " +
                        "Component test 'lte' failed against input '11.1'.");

            expect(stderr,
                "Should note when assertions are being tested")
                    .to.contain("Testing selector img,[src*=\"akamai\"]");

            done();
        });
    });


});