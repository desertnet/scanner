import {expect} from 'chai'

import Scanner from '../src'

describe("Scanner", function () {
  var scanner = null;
  var dialectedScanner = null;

  beforeEach(function () {
    scanner = new Scanner([
      {"dot": /\./},
      {"ident": /\w+/},
      {"space": /\s+/}
    ]);

    dialectedScanner = new Scanner({
      "foo": [
        {"num": /\d+/},
        {"other": /.+/}
      ],
      "bar": [
        {"word": /[a-z_]/i},
        {"other": /.+/}
      ]
    });
  });

  describe("#setSource", function () {
    it("should reset the dialect stack", function () {
      dialectedScanner.pushDialect("foo");
      dialectedScanner.pushDialect("bar");
      dialectedScanner.setSource("hi");
      expect(dialectedScanner.dialectStack()).to.deep.equal([]);
    })

    it("should set the current dialect to null if scanner has more than one dialect", function () {
      dialectedScanner.pushDialect("foo");
      dialectedScanner.pushDialect("bar");
      dialectedScanner.setSource("hi");
      expect(dialectedScanner.currentDialect()).to.be.null;
    })

    it("should not set the current dialect to null if the scanner has only one dialect", function () {
      scanner.setSource("hi");
      expect(scanner.currentDialect()).not.to.be.null;
    })
  })

  describe("#nextToken", function () {
    it("should be able to produce tokens", function () {
      scanner.setSource("net.desert");

      var netTok = scanner.nextToken();
      var dotTok = scanner.nextToken();
      var desTok = scanner.nextToken();
      var eofTok = scanner.nextToken();

      expect(netTok.type).to.equal("ident");
      expect(netTok.value).to.equal("net");
      expect(dotTok.type).to.equal("dot");
      expect(desTok.type).to.equal("ident");
      expect(desTok.value).to.equal("desert");
      expect(eofTok).to.equal(null);
    });

    it("should produce tokens with correct column and line numbers", function () {
      scanner.setSource("one two\n three\n\nfour");

      var tok;
      var tokens = [];
      while (tok = scanner.nextToken()) {
        if (tok.type === "space") continue;
        tokens.push(tok);
      }

      expect(tokens[0].line).to.equal(1);
      expect(tokens[0].column).to.equal(1);
      expect(tokens[1].line).to.equal(1);
      expect(tokens[1].column).to.equal(5);
      expect(tokens[2].line).to.equal(2);
      expect(tokens[2].column).to.equal(2);
      expect(tokens[3].line).to.equal(4);
      expect(tokens[3].column).to.equal(1);
    });

    it("should throw errors with relevant line and column numbers", function () {
      scanner.setSource("one\r\ntwo\r\nfail:here\r\nneversee");

      var tok;
      var error = null;
      var tokens = [];
      try {
        while (tok = scanner.nextToken()) {
          if (tok.type === "space") continue;
          tokens.push(tok);
        }
      }
      catch (e) {
        error = e;
      }

      expect(tokens.length).to.equal(3);
      expect(error).not.to.be.null;
      expect(error.name).to.equal("ScannerError");
      expect(error.index).to.equal(14);
      expect(error.line).to.equal(3);
      expect(error.column).to.equal(5);
    });

    it("should only process expected tokens", function () {
      scanner.setSource("word. word");

      var tok = scanner.nextToken(["dot", "ident"]);
      expect(tok.type).to.equal("ident");

      tok = scanner.nextToken(["dot", "ident"]);
      expect(tok.type).to.equal("dot");

      var error = null;
      try {
        tok = scanner.nextToken(["dot", "ident"]);
      }
      catch (e) {
        error = e;
      }
      expect(error).not.to.be.null;
    });

    it("should throw an error when there is no current dialect", function () {
      expect(function () { dialectedScanner.nextToken() }).to.throw();
    })

    it("should not crash when a LINE SEPARATOR character is in the input string", function () {
      scanner = new Scanner([ {"tagstart": /</}, {"text": /[^<]+/} ]);
      scanner.setSource("hello\n world \u2028 <br>\n foo\n");
      var generateTokens = function () { while (scanner.nextToken()) { /* noop */ } };
      expect(generateTokens).not.to.throw();
    })
  })

  describe("#currentDialect", function () {
    it("should return 'main' when the original dialect is the active one", function () {
      expect(scanner.currentDialect()).to.equal("main");
    })
  })

  describe("#dialects", function () {
    it("should return an array of available dialect names", function () {
      expect(scanner.dialects()).to.deep.equal(["main"]);
    })
  })

  describe("#setDialect", function () {
    it("should cause the scanner to use the specified dialect when fetching the next token", function () {
      var str = "42hello";
      dialectedScanner.setSource(str);

      dialectedScanner.setDialect("foo");
      var tok1 = dialectedScanner.nextToken();
      expect(tok1.type).to.equal("num");

      dialectedScanner.setDialect("bar");
      var tok2 = dialectedScanner.nextToken();
      expect(tok2.type).to.equal("word");
    })
  });

  describe("#pushDialect", function () {
    it("should set the current dialect", function () {
      dialectedScanner.pushDialect("bar");
      expect(dialectedScanner.currentDialect()).to.equal("bar");
    })
  })

  describe("#popDialect", function () {
    it("should set the current dialect to the dialect on top of the stack", function () {
      dialectedScanner.pushDialect("foo");
      dialectedScanner.pushDialect("bar");
      dialectedScanner.popDialect();
      expect(dialectedScanner.currentDialect()).to.equal("foo");
    })
  })
});
