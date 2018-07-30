import {expect} from 'chai'

import {BufferedRegExpScanner, createDialect, TokenDefinition} from '../src'

describe(`Token`, function () {
  describe(`instance property`, function () {
    let scanner, dialect

    beforeEach(function () {
      dialect = createDialect([Symbol('foo'), 'foo'])
      scanner = new BufferedRegExpScanner(`foo`)
    })

    describe(`toString()`, function () {
      it(`should return a string that describes the token`, function () {
        const token = scanner.generateTokensUsingDialect(dialect).next().value
        expect(token.toString()).to.equal(
          `{ type: Symbol(foo), start: 0, end: 3, line: 1, column: 1, value: 'foo' }`
        )
      })
    })

    describe(`definition`, function () {
      it(`should return the matching TokenDefinition object`, function () {
        const token = scanner.generateTokensUsingDialect(dialect).next().value
        expect(token)
          .to.have.property('definition')
          .that.is.an.instanceof(TokenDefinition)
          .that.equals(dialect.tokenDefinitions[0])
      })
    })
  })
})
