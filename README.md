# scanner

A regex-based string scanner/tokenizer for JavaScript

## Installation

```shell
npm install --save @desertnet/scanner
```

## Usage

### An Example

```javascript
const Scanner = require('@desertnet/scanner')

const body = `Hi! [img-1]
[img-2]
Bye[!]`

const embedTagScanner = new Scanner([
  {'tag': /\[\w+-\d+\]/},
  {'text': /[^\[]+/},
  {'bracket': /\[/}
])

let token
embedTagScanner.setSource(body)
while (token = embedTagScanner.nextToken()) {
  console.log(token)
}
```

Outputs:

```
Token { type: 'text',    value: 'Hi! ',    index: 0,  line: 1, column: 1 }
Token { type: 'tag',     value: '[img-1]', index: 4,  line: 1, column: 5 }
Token { type: 'text',    value: '\n',      index: 11, line: 2, column: 12 }
Token { type: 'tag',     value: '[img-2]', index: 12, line: 2, column: 1 }
Token { type: 'text',    value: '\nBye',   index: 19, line: 3, column: 8 }
Token { type: 'bracket', value: '[',       index: 23, line: 3, column: 4 }
Token { type: 'text',    value: '!]',      index: 24, line: 3, column: 5 }
```

### Dialects

In the context of this module, a **dialect** is an ordered mapping of a token-type to a regular expression that describes the token. In the above example you will see a `Scanner` object instantiated with an array of objects, with each object containing a single `RegExp` property. This pattern allows you to succinctly define a dialect for your scanner.

We call a dialect an ordered mapping because the order in which the token types are defined is important. The scanner will attempt to match the input string against the first regex in the dialect. If that fails, it will go on to the next one in the list. Once a match is made, a token with the matching type is generated. No attempts to match any remaining regexes in the dialect are undertaken.

It is generally a very good idea to ensure that your dialect accepts all inputs. If you do not, then an input string could cause the scanner to throw an "unexpected character" error. Notice in the example how the `text` token description matches everything that is not a `[` character, and the last token description matches a lone `[` character. This ensures that all inputs will generate a token. An alternate way of doing this would be to end your dialect with the following token description to match any single character:

```javascript
{'catchall': /[^]/}   // This is the same as `qr/./s` in Perl
```

### Multi-Dialect Scanners

Often a language is simply not describable using a single dialect. For example, HTML often contains inline CSS. Or JavaDoc annotations inside Java comments. Even something simple like HTML attribute values denoted by `"` and HTML attribute values denoted by `'` may necessitate distinct dialect definitions.

You can create a multi-dialect scanner by passing an object to the `Scanner` constructor. This object should be a mapping of dialect names to dialect definitions. For example, here is the start of a rather stripped down HTML multi-dialect scanner:

```javascript
const htmlScanner = new Scanner({
  // Starting dialect, for content "outside of a tag".
  "content": [
    {"text": /[^<>]+/},
    {"tagStart": /<[a-z][^\t\n\ \/\>]*/i},
    {"closeTagStart": /<\/[a-z][^\t\n\ \/\>]*/i},
    {"error": /[<>]/}
  ],

  // Dialect for the inside of tags.
  "tag": [
    {"tagEnd": />/},
    {"whitespace": /\s+/},
    {"selfClose": /\//},
    {"error": /['"<=]/},
    {"attributeStart": /[^>=\s\/]+/i}
  ],

  // Initial dialect for attributes.
  "attribute": [
    {"whitespace": /\s+/},
    {"attributeValueQuotedStart": /=['"]/},
    {"attributeValueStart": /=/},
    {"tagEnd": />/},
    {"selfClose": /\//},
    {"error": /['"<]/},
  ],

  // Dialect for closing tags.
  "closeTag": [
    {"tagEnd": />/},
    {"whitespace": /\s+/},
    {"error": /[^\s>]+/}
  ],

  // ...

})
```

Once you have a multi-dialect scanner you must call `scanner.pushDialect(dialectName)` to set the initial dialect. While you tokenize your string, you can call `.pushDialect()` and `.popDialect()` whenever your input changes contexts to a different dialect. (Alternately you may call `.setDialect()` directly, but do not mix this with using the scanner's dialect stack.)

## API

### new Scanner(dialectDefinition)

Constructs a new `Scanner` object with the given dialect definition(s). If `dialectDefinition` is an Array, then it is expected that the array contains a list of token descriptors, which is an object containing a single property that maps a token-type to a `RegExp`. If it is an object, then it is expected that each property maps a dialect name to an array of token descriptors. See the above definition of Dialects and Multi-Dialect scanners.

#### .setSource(input)

Sets the input string for the scanner. If you are reusing a scanner instance, calling this method will reset the scanner to the beginning of the new string.

#### .currentDialect()

Returns a string which is the name of the current dialect. For single-dialect scanners this will always be `'main'`.

#### .setDialect(name)

Sets the current dialect to the dialect specified by the string `name`. You do not need to call this for single-dialect scanners. For multi-dialect scanners, you are probably better off using the methods for managing the scanner's dialect stack.

#### .pushDialect(name)

Pushes the dialect specified by name onto the scanner's dialect stack, and sets it as the current dialect.

#### .popDialect()

Pops the topmost dialect from the scanner's dialect stack, and sets the current dialect to the dialect that is now at the top of the stack.

#### .nextToken([expectedTokens])

Returns a `Token` object for the next matching token in the source string. To scan a string, you keep calling this method until it returns `null`, which indicates the entire string has been scanned. This method can throw an error if the dialect cannot match the next token, so be sure to define your dialects to cover all inputs.

The optional `expectedTokens` parameter is an array of token type names for the current dialect. Use this if it makes sense to only scan for a subset of token types. However, if you find yourself doing this, it may be better to switch to a multi-dialect scanner.

### new Scanner.Token(type, value, index, line, column)

Generally, instances of the `Token` class should not be instantiated directly. However the constructor is publicly available as it can be convenient to instantiate your own in tests.

In typical usage, they are returned to you by `scanner.nextToken()`. They have the following readable properties:

  - `type`: The name of the token type. (A string.)
  - `value`: The matching substring from the input.
  - `index`: The zero-based index of the start of the token in the input string.
  - `line`: The one-based index of the line the token starts at in the input string.
  - `column`: The one-based index of the column the token starts at within the line.
