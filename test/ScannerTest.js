import {expect} from 'chai'
import sinon from 'sinon'

import {
  Scanner, Dialect, TokenDefinition, Token, UnexpectedCharacter
} from '../src'

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
    const dialect = new Dialect([new TokenDefinition('foo', 'foo')])

    let scanner
    beforeEach(function () {
      scanner = new Scanner('foo\nbar')
    })

    describe(`determineNextTokenUsingDialect()`, function () {
      it(`should always throw`, function () {
        expect(() => scanner.determineNextTokenUsingDialect())
          .to.throw(/overridden/i)
      })
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

      context(`when nothing in dialect matches`, function () {
        it(`should return UnexpectedCharacter Token`, function () {
          sinon.stub(scanner, 'determineNextTokenUsingDialect')
            .returns(undefined)
          expect(scanner.generateTokensUsingDialect(dialect).next().value)
            .to.be.an.instanceof(Token)
            .and.to.include({
              type: UnexpectedCharacter,
              value: 'f'
            })
        })
      })
    })

    describe(`lineNumberForOffset()`, function () {
      it(`should return the line number for the offset in the subject`, function () {
        expect(scanner.lineNumberForOffset(0)).to.equal(1)
        expect(scanner.lineNumberForOffset(4)).to.equal(2)
      })
    })

    describe(`columnNumberForOffset()`, function () {
      it(`should return the column number for the offset in the subject`, function () {
        expect(scanner.columnNumberForOffset(0)).to.equal(1)
        expect(scanner.columnNumberForOffset(1)).to.equal(2)
        expect(scanner.columnNumberForOffset(4)).to.equal(1)
      })
    })
  })
})
