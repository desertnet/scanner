describe("Foundation.Scanner", function () {
	var scanner = null;
	var dialectedScanner = null;

	beforeEach(function () {
		scanner = new Foundation.Scanner([
			{"dot": /\./},
			{"ident": /\w+/},
			{"space": /\s+/}
		]);

		dialectedScanner = new Foundation.Scanner({
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
			expect(dialectedScanner.dialectStack()).toEqual([]);
		})

		it("should set the current dialect to null if scanner has more than one dialect", function () {
			dialectedScanner.pushDialect("foo");
			dialectedScanner.pushDialect("bar");
			dialectedScanner.setSource("hi");
			expect(dialectedScanner.currentDialect()).toBeNull();
		})

		it("should not set the current dialect to null if the scanner has only one dialect", function () {
			scanner.setSource("hi");
			expect(scanner.currentDialect()).not.toBeNull();
		})
	})

	describe("#nextToken", function () {
		it("should be able to produce tokens", function () {
			scanner.setSource("net.desert");

			var netTok = scanner.nextToken();
			var dotTok = scanner.nextToken();
			var desTok = scanner.nextToken();
			var eofTok = scanner.nextToken();

			expect(netTok.type).toBe("ident");
			expect(netTok.value).toBe("net");
			expect(dotTok.type).toBe("dot");
			expect(desTok.type).toBe("ident");
			expect(desTok.value).toBe("desert");
			expect(eofTok).toBe(null);
		});

		it("should produce tokens with correct column and line numbers", function () {
			scanner.setSource("one two\n three\n\nfour");

			var tok;
			var tokens = [];
			while (tok = scanner.nextToken()) {
				if (tok.type === "space") continue;
				tokens.push(tok);
			}

			expect(tokens[0].line).toBe(1);
			expect(tokens[0].column).toBe(1);
			expect(tokens[1].line).toBe(1);
			expect(tokens[1].column).toBe(5);
			expect(tokens[2].line).toBe(2);
			expect(tokens[2].column).toBe(2);
			expect(tokens[3].line).toBe(4);
			expect(tokens[3].column).toBe(1);
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

			expect(tokens.length).toBe(3);
			expect(error).not.toBeNull();
			expect(error.name).toBe("ScannerError");
			expect(error.index).toBe(14);
			expect(error.line).toBe(3);
			expect(error.column).toBe(5);
		});

		it("should only process expected tokens", function () {
			scanner.setSource("word. word");

			var tok = scanner.nextToken(["dot", "ident"]);
			expect(tok.type).toBe("ident");

			tok = scanner.nextToken(["dot", "ident"]);
			expect(tok.type).toBe("dot");

			var error = null;
			try {
				tok = scanner.nextToken(["dot", "ident"]);
			}
			catch (e) {
				error = e;
			}
			expect(error).not.toBeNull();
		});

		it("should throw an error when there is no current dialect", function () {
			expect(function () { dialectedScanner.nextToken() }).toThrow();
		})

		it("should not crash when a LINE SEPARATOR character is in the input string", function () {
			scanner = new Foundation.Scanner([ {"tagstart": /</}, {"text": /[^<]+/} ]);
			scanner.setSource("hello\n world \u2028 <br>\n foo\n");
			var generateTokens = function () { while (scanner.nextToken()) { /* noop */ } };
			expect(generateTokens).not.toThrow();
		})
	})

	describe("#currentDialect", function () {
		it("should return 'main' when the original dialect is the active one", function () {
			expect(scanner.currentDialect()).toEqual("main");
		})
	})

	describe("#dialects", function () {
		it("should return an array of available dialect names", function () {
			expect(scanner.dialects()).toEqual(["main"]);
		})
	})

	describe("#setDialect", function () {
		it("should cause the scanner to use the specified dialect when fetching the next token", function () {
			var str = "42hello";
			dialectedScanner.setSource(str);

			dialectedScanner.setDialect("foo");
			var tok1 = dialectedScanner.nextToken();
			expect(tok1.type).toEqual("num");

			dialectedScanner.setDialect("bar");
			var tok2 = dialectedScanner.nextToken();
			expect(tok2.type).toEqual("word");
		})
	});

	describe("#pushDialect", function () {
		it("should set the current dialect", function () {
			dialectedScanner.pushDialect("bar");
			expect(dialectedScanner.currentDialect()).toBe("bar");
		})
	})

	describe("#popDialect", function () {
		it("should set the current dialect to the dialect on top of the stack", function () {
			dialectedScanner.pushDialect("foo");
			dialectedScanner.pushDialect("bar");
			dialectedScanner.popDialect();
			expect(dialectedScanner.currentDialect()).toBe("foo");
		})
	})
});
