import {expect} from 'chai'
import assert from 'assert'

import {
  BufferedScanner, Scanner, TokenDefinition, Dialect
} from '../src'

describe(`BufferedScanner`, function () {
  describe(`constructor()`, function () {
    it(`should return a subclass of Scanner`, function () {
      expect(new BufferedScanner('foo')).to.be.instanceof(Scanner)
    })
  })

  describe(`instance property`, function () {
    const myLang = new Dialect([
      new TokenDefinition('IF', 'if'),
      new TokenDefinition('THIS', 'this'),
      new TokenDefinition('THEN', 'then'),
      new TokenDefinition('SPACE', String.raw`\s+`),
      new TokenDefinition('LPAREN', String.raw`\(`),
      new TokenDefinition('RPAREN', String.raw`\)`),
      new TokenDefinition('LBRACE', String.raw`\{`),
      new TokenDefinition('RBRACE', String.raw`\}`),
      new TokenDefinition('VAR', String.raw`\w+`),
    ])

    let scanner
    beforeEach(function () {
      scanner = new BufferedScanner(`if (this)\nthen {that}`)
    })

    describe(`generateTokensUsingDialect()`, function () {
      it(`should return an iterable that resolves to a list of expected tokens`, async function () {
        const tokens = []

        for (const token of scanner.generateTokensUsingDialect(myLang)) {
          tokens.push(token)
        }

        const expected = [
          {type: 'IF', value: 'if', start: 0, line: 1, column: 1},
          {type: 'SPACE', value: ' ', start: 2, line: 1, column: 3},
          {type: 'LPAREN', value: '(', start: 3, line: 1, column: 4},
          {type: 'THIS', value: 'this', start: 4, line: 1, column: 5},
          {type: 'RPAREN', value: ')', start: 8, line: 1, column: 9},
          {type: 'SPACE', value: '\n', start: 9, line: 1, column: 10},
          {type: 'THEN', value: 'then', start: 10, line: 2, column: 1},
          {type: 'SPACE', value: ' ', start: 14, line: 2, column: 5},
          {type: 'LBRACE', value: '{', start: 15, line: 2, column: 6},
          {type: 'VAR', value: 'that', start: 16, line: 2, column: 7},
          {type: 'RBRACE', value: '}', start: 20, line: 2, column: 11},
        ]

        tokens.forEach((token, i) => {
          ['type', 'value', 'start', 'line', 'column'].forEach(prop => {
            assert.strictEqual(
              token[prop], expected[i][prop],
              `Got '${token[prop]}' for '${prop}' of expected token: ${JSON.stringify(expected[i])}`
            )
          })
        })
      })
    })
  })
})
