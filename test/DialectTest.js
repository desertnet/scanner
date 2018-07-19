import {expect} from 'chai'

import {Dialect, TokenDefinition} from '../src'

describe(`Dialect`, function () {
  describe(`constructor()`, function () {
    it(`should set the identifier property with passed identifier`, function () {
      const myDialect = Symbol('myDialect')
      expect(new Dialect(myDialect)).to.have.property('identifier', myDialect)
    })
  })

  describe(`instance property`, function () {
    let dialect

    beforeEach(function () {
      dialect = new Dialect(Symbol('myDialect'))
    })

    describe(`addTokenDefinition()`, function () {
      it(`should throw if passed anything other than a TokenDefinition`, function () {
        expect(() => dialect.addTokenDefinition('foo')).to.throw(TypeError)
      })

      it(`should not throw when passed a TokenDefinition`, function () {
        const tokDef = new TokenDefinition(Symbol('myTok'), 'foo')
        expect(() => dialect.addTokenDefinition(tokDef)).to.not.throw()
      })

      it(`should append to the list of token definitions`, function () {
        const tokDef1 = new TokenDefinition(Symbol('tok1'), 'foo1')
        const tokDef2 = new TokenDefinition(Symbol('tok2'), 'foo2')
        dialect.addTokenDefinition(tokDef1)
        dialect.addTokenDefinition(tokDef2)
        expect(dialect.tokenDefinitions).to.deep.equal([tokDef1, tokDef2])
      })
    })
  })
})
