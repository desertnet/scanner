# @desertnet/scanner

A lexical analyzer for JavaScript.


## Compatibility

Version 2 is a complete rewrite with a new API, and requires a number of ES6 features. If you need compatibility with older browsers, the [version 1 API](https://github.com/desertnet/scanner/tree/v1) is still supported.


## Installation

```shell
npm install @desertnet/scanner
```


## Usage

Let’s say you want to design a language for embedding things like images or videos in arbitrary text, using tags that look something like `[img-1]`. We can use this package to find those embedded tags.

```javascript
import {createDialect, BufferedRegExpScanner} from '@desertnet/scanner'

const input = `Hi! [img-1]
[img-2]
Bye[!]`
```

First, declare the types of tokens you want to recognize.

```javascript
const tag = Symbol('tag')
const text = Symbol('text')
```

Describe your language using regular expressions. `String.raw` can help you avoid needing to escape backslashes.

```javascript
const r = String.raw
const embedTagLang = createDialect(
  [ tag,  r`\[\w-\d+\]` ],
  [ text, r`[^\[]+` ],
  [ text, r`\[` ],
)
```

Create a scanner to read the input string.

```javascript
const embedTagScanner = new BufferedRegExpScanner(input)
```

Iterate over the tokens and do something with them.

```javascript
for (const token of embedTagScanner.generateTokensUsingDialect(embedTagLang)) {
  const {type, start, end, line, column, value} = token
  console.log({type, start, end, line, column, value})
}
```

Here’s what that outputs.

```
{ type: Symbol(text), start: 0,  end: 4,  line: 1, column: 1,  value: 'Hi! ' }
{ type: Symbol(tag),  start: 4,  end: 11, line: 1, column: 5,  value: '[img-1]' }
{ type: Symbol(text), start: 11, end: 12, line: 1, column: 12, value: '\n' }
{ type: Symbol(tag),  start: 12, end: 19, line: 2, column: 1,  value: '[img-2]' }
{ type: Symbol(text), start: 19, end: 23, line: 2, column: 8,  value: '\nBye' }
{ type: Symbol(text), start: 23, end: 24, line: 3, column: 4,  value: '[' }
{ type: Symbol(text), start: 24, end: 26, line: 3, column: 5,  value: '!]' }
```


## API

### new BufferedRegExpScanner(inputString)

A `Scanner` subclass that scans a string using JavaScript `RegExp` patterns. “Buffered” refers to the fact that the entire input must be buffered into a string before scanning can start. It operates on the principle of “maximal munch”: if more than one possible `TokenDefinition` matches, the longest match is the token that is produced. In the event of a tie, the first `TokenDefinition` passed to `Dialect` is chosen amongst the longest matches.

Supported `TokenDefinition` `flags`:

  - `ignoreCase`: When set to `true`, acts like the `i` flag for regular expressions, causing the pattern to be case insensitive.

There are no specific properties for this `Scanner` subclass, see `Scanner` on how to use it to extract tokens from `inputString`.


### createDialect(...tokenDefinitions)

This is a convenience function for creating a `Dialect` object with `TokenDefinition` objects. You pass it arrays of arguments to the `TokenDefinition` constructor, and a new `Dialect` object will be returned with those definitions.


### new Dialect(tokenDefinitions)

A `Dialect` object is an ordered collection of `TokenDefinition` objects, passed as an array to this constructor. A dialect may be a complete language definition, or it may be a subset of a language.

#### dialect.tokenDefinitions

An array of `TokenDefinition` objects that define the dialect.


### Scanner

The `Scanner` class should not be instantiated directly. Instead, instantiate a subclass like `BufferedRegExpScanner`.

#### scanner.generateTokensUsingDialect(dialect)

Returns a JavaScript `Generator` that yields `Token`s based on the passed `Dialect`. You can use this as the `Iterable` in a `for...of` loop.

In the event that no `TokenDefinition` in `dialect` matches, the generator will produce a final `Token` with a `type` property equal to the `UnexpectedCharacter` symbol and containing the `start` and `end` of the character. The `UnexpectedCharacter` symbol is exported by `@desertnet/scanner`. When this token is produced, the `position` property of scanner will not be updated.

#### scanner.lineNumberForOffset(offset)

Returns the line number for the passed `offset` of the input string.

#### scanner.columnNumberForOffset(offset)

Returns the column number for the passed `offset` of the input string.

#### scanner.determineNextTokenUsingDialect(dialect)

This method should never be invoked by anything other than the `Scanner` class. However, if you are making a subclass of `Scanner` you must implement this method. The expected return value is an array with two values: a token type identifier (the value of `token.type`), and the offset within the input string where the token ends (the value of `token.end`). If the end of the input is reached, it should return an array with the first value being that of the `EOF` symbol exported by `@desertnet/scanner`. If no token can be matched, `undefined` should be returned.

#### scanner.subject

The input string.

#### scanner.position

The offset into the input string that the scanner is currently evaluating.


### Token

The `Token` class should only be instantiated by the `Scanner` class.

#### Memory Usage

Instances of `Token` retain a reference to the `Scanner` that generated them, which will include a reference to the input string. This is so that properties like `value`, `line` and `column` can be computed on demand. However it does mean that to reclaim the memory used by the input string you must release any `Token` instances.

#### token.type

The token’s type identifier.

#### token.start

The offset into the input string where the token begins.

#### token.end

The offset into the input string where the token has ended. This is exclusive, so the offset of the last character of the token is actually `token.end - 1`. This is in keeping with how JavaScript string methods like `.slice()` work. It also allows for zero-length tokens to be represented, though it’s not clear if it is useful for a language to define tokens that can not have a length.

#### token.value

The string value of the token.

#### token.line

The line number that the token starts on. Note that this is a computed property, and the first access of it (or `token.column`) will trigger line number indexing of the input string. This means the first access of either `line` or `column` will be relatively slow, but subsequent accesses will be very fast.

#### token.column

The column number that the token starts on. Like `line`, this is a computed property; see `token.line` above for details.


### new TokenDefinition(typeIdentifier, pattern, flags)

A `TokenDefinition` defines a mapping of a pattern to a token type identifier. In other words, you provide a `pattern`, and when the scanner matches that pattern in the input string, a `Token` object with its `type` property set to the provided `typeIdentifier` is generated.

  - `typeIdentifier`: A value used to identify the type of `Token` objects this definition produces. It can be of any type, but it is recommended that you use `Symbol`s for efficiency and to prevent unintended naming collisions.
  - `pattern`: A string defining a pattern to be used by the scanner to match the input string. The format of this depends on the scanner implementation, but `BufferedRegExpScanner` expects JavaScript `RegExp` syntax.
  - `flags`: A plain object with flags for the scanner implementation. For example, to tell `BufferedRegExpScanner` to match case insensitively for this pattern, you would pass `{ignoreCase: true}`.


#### tokenDefinition.identifier

The passed `typeIdentifier` constructor parameter.

#### tokenDefinition.pattern

The passed `pattern` constructor parameter.

#### tokenDefinition.flags

The passed `flags` constructor parameter.
