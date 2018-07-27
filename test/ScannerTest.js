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

    it(`should not throw an error if passed subject is empty string`, function () {
      expect(() => new Scanner('')).to.not.throw()
    })

    it(`should throw if passed subject is not a string`, function () {
      expect(() => new Scanner(9)).to.throw(TypeError)
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
      scanner = new Scanner('foo\nbar\n🤣\n\uD83E\n\uD83E')
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
        beforeEach(function () {
          sinon.stub(scanner, 'determineNextTokenUsingDialect')
            .returns(undefined)
        })

        describe(`returned Token`, function () {
          let token

          beforeEach(function () {
            token = scanner.generateTokensUsingDialect(dialect).next().value
          })

          it(`should have type of UnexpectedCharacter`, function () {
            expect(token)
              .to.be.an.instanceof(Token)
              .and.to.include({
                type: UnexpectedCharacter,
                value: 'f'
              })
          })

          it(`should have the correct length when next character is single-code-unit`, function () {
            expect(token).to.have.property('start').that.equals(0)
            expect(token).to.have.property('end').that.equals(1)
          })

          it(`should have the correct length when next character is multi-code-unit`, function () {
            scanner.position = 8
            const token = scanner.generateTokensUsingDialect(dialect).next().value
            expect(token).to.have.property('start').that.equals(8)
            expect(token).to.have.property('end').that.equals(10)
          })

          it(`should have the correct length when next character is invalid mutli-code-unit`, function () {
            scanner.position = 11
            const token = scanner.generateTokensUsingDialect(dialect).next().value
            expect(token).to.have.property('start').that.equals(11)
            expect(token).to.have.property('end').that.equals(12)
          })

          it(`should have the correct length when next character incomplete multi-code-unit`, function () {
            scanner.position = 13
            const token = scanner.generateTokensUsingDialect(dialect).next().value
            expect(token).to.have.property('start').that.equals(13)
            expect(token).to.have.property('end').that.equals(14)
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
