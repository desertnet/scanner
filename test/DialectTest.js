import {expect} from 'chai'

import {Dialect, TokenDefinition} from '../src'

describe(`Dialect`, function () {
  describe(`constructor()`, function () {
    it(`should set the identifier property with passed identifier`, function () {
      const myDialect = Symbol('myDialect')
      const tokDef = new TokenDefinition(Symbol('myTok'), 'foo')
      expect(new Dialect(myDialect, [tokDef])).to.have.property('identifier', myDialect)
    })

    it(`should throw if not passed any params`, function () {
      expect(() => new Dialect()).to.throw(TypeError)
    })

    it(`should throw if not passed an array for second argument`, function () {
      expect(() => new Dialect('foo')).to.throw(TypeError)
    })

    it(`should throw if passed an empty array of token defitions`, function () {
      expect(() => new Dialect('foo', [])).to.throw()
    })

    it(`should throw if passed anything other than TokenDefinitions`, function () {
      expect(() => new Dialect('foo', ['bar'])).to.throw(TypeError)
    })

    it(`should not throw when passed array of TokenDefinition`, function () {
      const tokDef = new TokenDefinition(Symbol('myTok'), 'foo')
      expect(() => new Dialect('foo', [tokDef])).to.not.throw()
    })
  })

  describe(`instance property`, function () {
    describe(`tokenDefinitions`, function () {
      it(`should return TokenDefinition objects that were passed to constructor`, function () {
        const tokDef1 = new TokenDefinition(Symbol('myTok1'), 'foo')
        const tokDef2 = new TokenDefinition(Symbol('myTok2'), 'bar')
        const dialect = new Dialect('baz', [tokDef1, tokDef2])
        expect(dialect.tokenDefinitions).to.deep.equal([tokDef1, tokDef2])
      })
    })
  })
})
