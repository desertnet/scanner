import {expect} from 'chai'

import {
  BufferedScanner, Scanner, TokenDefinition, Dialect, Token
} from '../src'

describe(`BufferedScanner`, function () {
  describe(`constructor()`, function () {
    it(`should return a subclass of Scanner`, function () {
      expect(new BufferedScanner('foo')).to.be.instanceof(Scanner)
    })
  })

  describe(`instance property`, function () {
    const myLang = new Dialect('myLang', [
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
      scanner = new BufferedScanner(`if (this) then {that}`)
    })

    describe(`generateTokensUsingDialect()`, function () {
      it(`should return an iterable that resolves to a list of expected tokens`, async function () {
        const tokens = []

        for (const token of scanner.generateTokensUsingDialect(myLang)) {
          tokens.push(token)
        }

        expect(tokens).to.deep.equal([
          new Token('IF', 'if', 0),
          new Token('SPACE', ' ', 2),
          new Token('LPAREN', '(', 3),
          new Token('THIS', 'this', 4),
          new Token('RPAREN', ')', 8),
          new Token('SPACE', ' ', 9),
          new Token('THEN', 'then', 10),
          new Token('SPACE', ' ', 14),
          new Token('LBRACE', '{', 15),
          new Token('VAR', 'that', 16),
          new Token('RBRACE', '}', 20),
        ])
      })
    })
  })
})
