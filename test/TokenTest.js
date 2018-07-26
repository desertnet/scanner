import {expect} from 'chai'

import {BufferedRegExpScanner, createDialect} from '../src'

describe(`Token`, function () {
  describe(`instance property`, function () {
    describe(`toString()`, function () {
      it(`should return a string that describes the token`, function () {
        const dialect = createDialect({ [Symbol('foo')]: 'foo' })
        const scanner = new BufferedRegExpScanner(`foo`)
        const token = scanner.generateTokensUsingDialect(dialect).next().value
        expect(token.toString()).to.equal(
          `{ type: Symbol(foo), start: 0, end: 3, line: 1, column: 1, value: 'foo' }`
        )
      })
    })
  })
})
