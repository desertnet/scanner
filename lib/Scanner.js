/**
 * Given a list of token descriptors, generate tokens from a string.
 */
export default class Scanner {
  /**
   * @param {(Array.<Object.<string,RegExp>>|Object.<string,Array.<Object.<string,RegExp>>>)=} descriptors
   */
  constructor (descriptors) {
    /**
     * The dialect the scanner is currently using.
     * @private
     * @type {Dialect?}
     */
    this._dialect = null;

    /**
     * The dialect stack.
     * @private
     * @type {Array.<string>}
     */
    this._dialectStack = [];

    /**
     * All the dialects this scanner can use.
     * @private
     * @type {Object.<string,Dialect>}
     */
    this._dialects = {};

    /**
     * @private
     * @type {string?}
     */
    this._source = null;

    /**
     * @private
     * @type {number}
     */
    this._pos = 0;

    /**
     * @private
     * @type {number}
     */
    this._line = 0;

    /**
     * @private
     * @type {number}
     */
    this._column = 0;

    // Set up dialects specified in the constructor call.
    if (descriptors) {
      // If the argument passed to the constructor was just a single
      // array, then we should expect just one dialect. So let's call
      // it "main".
      if (Array.isArray(descriptors)) {
        descriptors = {"main": descriptors};
      }

      // Assuming we have an object containing dialect descriptons...
      if (Object.keys(descriptors).length) {
        // Loop through the dialects and add them one by one.
				Object.keys(descriptors).forEach(name => {
					this.addDialect(name, descriptors[name]);
				});

        // Set the current dialect if there is only one dialect.
        if (Object.keys(descriptors).length === 1) {
          this.setDialect(Object.keys(descriptors)[0]);
        }
      }
    }
	}

  /**
   * @public
   * @param {string?} sourceStr
   */
  setSource (sourceStr) {
    this._source = sourceStr + "";  // Copy the string.

    this._pos = 0;
    this._line = 1;
    this._column = 1;

    if (this.dialects().length > 1) {
      this.setDialect(null);
    }
    this._dialectStack = [];
  }

  /**
   * Returns the name of the current dialect being used by the scanner.
   * @public
   * @return {string?}
   */
  currentDialect () {
    return this._dialect ? this._dialect.name() : null;
  }

  /**
   * Returns an array of available dialect names.
   * @private
   * @return {Array.<string>}
   */
  dialects () {
    return Object.keys(this._dialects || {});
  }

	/**
	 * Add a new dialect from caller's token descriptions.
	 * @public
	 * @param {string} name
	 * @param {Array.<Object.<string,RegExp>>} descriptors
	 */
	addDialect (name, descriptors) {
		if (this._dialects[name]) {
			throw new ScannerError("Dialect \""+name+"\" already exists.", this);
		}

		var dialect = this.createDialect(name, descriptors);
		this._dialects[name] = dialect;
	}

	/**
	 * Sets the current dialect of the scanner. Note that this does not
	 * affect the dialect stack, so it's best to avoid using it alongside
	 * the pushDialect and popDialect methods.
	 * @public
	 * @param {string?} name
	 */
	setDialect (name) {
		if (name === null) {
			this._dialect = null;
			return;
		}

		if (! this._dialects[name]) {
			throw new ScannerError("No such dialect: \""+name+"\".", this);
		}

		this._dialect = this._dialects[name];
	}

	/**
	 * Push the current dialect onto the dialect stack and set the current
	 * dialect to the specified dialect.
	 * @public
	 * @param {string} name
	 */
	pushDialect (name) {
		if (this._dialect) {
			this._dialectStack.push(this.currentDialect());
		}
		this.setDialect(name);
	}

	/**
	 * Set the current dialect to the dialect on the top of the dialect
	 * stack and remove it from the stack.
	 * @public
	 */
	popDialect () {
		this.setDialect(this._dialectStack.pop() || null);
	}

	/**
	 * Return the current dialect stack.
	 * @private
	 * @return {Array.<string>}
	 */
	dialectStack () {
		return this._dialectStack;
	}

	/**
	 * Generate a Dialect from caller's token
	 * descriptions.
	 * @private
	 * @param {string} name
	 * @param {Array.<Object.<string,RegExp>>} descriptors
	 * @return {Dialect}
	 */
	createDialect (name, descriptors) {
		var collectedDescriptors = [];

		var typesSeen = {};
		for (var i = 0; i < descriptors.length; i++) {
			var descriptor = descriptors[i];

			var j = 0;
			for (var type in descriptor) {
				// Don't allow more than one type/regex pair per descriptor.
				if (j >= 1) throw new ScannerError(
					"Found more than one type/regex pair in descriptor.",
					this
				);

				// Make sure we don't run into duplicate descriptor type names.
				if (typesSeen[type]) {
					throw new ScannerError(
						"Found duplicate descriptor type name: " + type, this
					);
				}
				typesSeen[type] = true;

				collectedDescriptors.push(
					new TokenDescriptor(type, descriptor[type])
				);

				j++;
			}
		}

		return new Dialect(name, collectedDescriptors);
	}

	/**
	 * Find and return the next token in the source string. Throws a
	 * ScannerError if the scanner can't continue. Returns null when
	 * the entire string has been scanned.
	 * @public
	 * @param {Array.<string>=} expectedTokens
	 * @return {Token}
	 */
	nextToken (expectedTokens) {
		// Sanity check to ensure that we have a dialect currently selected.
		if (! this._dialect) {
			throw new ScannerError("Dialect was not set.", this);
		}

		// Sanity check to make sure caller has set us up with a source string.
		if (this._source === null) {
			throw new ScannerError("Source string was not set.", this);
		}

		// EOF
		if (this._pos === this._source.length) {
			return null;
		}

		// Get the list of token descriptors we're going to iterate over in our
		// attempt to match the source string.
		var descriptors = this._dialect.descriptors();
		if (expectedTokens) {
			descriptors = [];
			for (var i = 0; i < expectedTokens.length; i++) {
				var type = expectedTokens[i];
				var descriptor = this._dialect.getDescriptor(type);
				if (!descriptor) {
					throw new ScannerError("Unknown descriptor: "+type, this);
				}
				descriptors.push(descriptor);
			}
		}

		var token = null;
		for (var i = 0; i < descriptors.length; i++) {
			var descriptor = descriptors[i];

			descriptor.regex.lastIndex = this._pos;
			var match = descriptor.regex.exec(this._source);
			if (match) {
				// If our match didn't start at _pos, we haven't really matched
				// because the match is down the string somewhere. Ideally we'd
				// be able to use the "sticky" /y flag instead, proposed in ES6:
				// http://wiki.ecmascript.org/doku.php?id=harmony:regexp_y_flag
				if (match.index != this._pos) continue;

				// Keep track of what line we're on.
				var lines = 0;
				var lineMatches = match[0].match(/\r\n|\r|\n/g);
				if (lineMatches) lines = lineMatches.length;
				this._line += lines;

				// Create the token!
				token = new Token(
					descriptor.type,
					match[0],
					this._pos,
					this._line,
					this._column
				);

				// Keep track of the column we're on.
				var colIncrement = match[0].length;
				if (lines > 0) {
					this._column = 1;
					var columnMatch = match[0].match(/(?:\r\n|\r|\n).*?$/m);
					colIncrement = columnMatch[0].replace(/^(?:\r\n|\r|\n)/, "").length;
				}
				this._column += colIncrement;

				// We do some special stuff when there's a zero-length match.
				// Not sure if it makes sense to have a scanner look for
				// zero length strings, but we want to be on the safe side.
				var zeroLengthMatch = match[0].length === 0;

				// Fix IE's incorrect lastIndex value on zero-length matches.
				// See: http://blog.stevenlevithan.com/archives/exec-bugs
				if (zeroLengthMatch && descriptor.regex.lastIndex > match.index) {
					descriptor.regex.lastIndex--;
				}

				// Advance our pos pointer. If we hit a zero-length match, then
				// increment by one so we don't end up in an infinite loop.
				this._pos = descriptor.regex.lastIndex + (zeroLengthMatch ? 1 : 0);

				// We've matched a token, so we're done with the loop.
				break;
			}
		};

		// We were unable to match a token. Let's report the error.
		if (! token) throw new ScannerError("Unexptected character.", this);

		return token;
	};
}




/**
 * @public
 * @extends {Error}
 * @param {string} message
 * @param {Scanner} scanner
 */
class ScannerError extends Error {
	constructor (message, scanner) {
	  super(message);
	  this.name = "ScannerError";
	  this.sourceString = scanner._source;
	  this.index = scanner._pos;
	  this.line = scanner._line;
	  this.column = scanner._column;
	}
}


/**
 * @private
 * @constructor
 * @param {string} type
 * @param {RegExp} regex
 */
class TokenDescriptor {
	constructor (type, regex) {
	  this.type = type;

	  // Normalize regex flags.
	  var flags = "gm";
	  if (regex.ignoreCase) flags += "i";

	  this.regex = new RegExp(regex.source, flags);
	}
}

class Token {
  /**
   * @param {string} type
   * @param {string} value
   * @param {number} index
   * @param {number} line
   * @param {number} column
   */
	constructor (type, value, index, line, column) {
	  /** @type {string} */ this.type = type;
	  /** @type {string} */ this.value = value;
	  /** @type {number} */ this.index = index;
	  /** @type {number} */ this.line = line;
	  /** @type {number} */ this.column = column;
	}
}


/**
 * A collection of token descriptor objects.
 * @constructor
 * @private
 * @param {string} name
 * @param {Array.<TokenDescriptor>} descriptors
 */
class Dialect {
	constructor (name, descriptors) {
	  /**
	   * @private
	   * @type {string}
	   */
	  this._name = name;

	  /**
	   * @private
	   * @type {Array.<TokenDescriptor>}
	   */
	  this._descriptors = descriptors;

	  /**
	   * @private
	   * @type {Object.<string,TokenDescriptor>|null}
	   */
	  this._descriptorsHash = null;
	}

	/**
	 * @private
	 * @return {string}
	 */
	name () {
	  return this._name;
	}

	/**
	 * @private
	 * @return {Array.<TokenDescriptor>}
	 */
	descriptors () {
	  return this._descriptors;
	}

	/**
	 * Grab a token decriptor by type name.
	 * @protected
	 * @param {string} type
	 * @return {TokenDescriptor}
	 */
	getDescriptor (type) {
	  // Initialize the descriptors hash if it isn't already defiend. This
	  // just makes descriptor lookups fast.
	  if (!this._descriptorsHash) {
	    this._descriptorsHash = {};
	    for (var i = 0; i < this._descriptors.length; i++) {
	      var descriptor = this._descriptors[i];
	      this._descriptorsHash[descriptor.type] = descriptor;
	    }
	  }

	  return this._descriptorsHash[type] || null;
	}
}
