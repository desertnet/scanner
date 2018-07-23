import {expect} from 'chai'

import {Scanner, Dialect, TokenDefinition} from '../src'

describe(`Scanner`, function () {
  describe(`constructor()`, function () {
    it(`should throw an error if no subject is passed`, function () {
      expect(() => new Scanner()).to.throw(TypeError)
    })

    it(`should set the subject property`, function () {
      const scanner = new Scanner('foo')
      expect(scanner.subject).to.equal('foo')
    })

    it(`should set the position property to 0`, function () {
      const scanner = new Scanner('foo')
      expect(scanner).to.have.property('position').that.equals(0)
    })
  })

  describe(`instance property`, function () {
    const dialect = new Dialect('foo', [new TokenDefinition('foo', 'foo')])

    let scanner
    beforeEach(function () {
      scanner = new Scanner('foo')
    })

    describe(`generateTokensUsingDialect()`, function () {
      it(`should throw when passed no arguments`, async function () {
        await expect(() => scanner.generateTokensUsingDialect().next())
          .to.be.throw(TypeError)
      })

      it(`should throw when passed anything other than a Dialect`, async function () {
        await expect(() => scanner.generateTokensUsingDialect('foo').next())
          .to.throw(TypeError)
      })

      it(`should return an iterable`, function () {
        expect(scanner.generateTokensUsingDialect(dialect))
          .to.have.property(Symbol.iterator)
          .that.is.a('function')
      })
    })
  })
})
