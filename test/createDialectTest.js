import {expect} from 'chai'

import {createDialect, Dialect} from '../src'

describe(`createDialect()`, function () {
  it(`should throw if passed nothing`, function () {
    expect(() => createDialect()).to.throw(TypeError)
  })

  it(`should throw if passed something other than an array`, function () {
    expect(() => createDialect({})).to.throw(TypeError)
  })

  it(`should throw if any values of passed object are not arrays`, function () {
    expect(() => createDialect([], {})).to.throw(TypeError)
  })

  it(`should not throw when token types are Symbols`, function () {
    expect(() => createDialect([Symbol(), 'foo'])).to.not.throw()
  })

  context(`returned value`, function () {
    it(`should be a Dialect object`, function () {
      expect(createDialect(['FOO', 'foo'])).to.be.an.instanceof(Dialect)
    })

    it(`should contain TokenDefinition objects in passed order`, function () {
      const dialect = createDialect(
        ['FOO', 'foo'],
        ['BAR', 'bar'],
        ['BAZ', 'baz'],
      )

      const tokenDefs = dialect.tokenDefinitions
      expect(tokenDefs[0]).to.have.property('identifier').that.equals('FOO')
      expect(tokenDefs[0]).to.have.property('pattern').that.equals('foo')
      expect(tokenDefs[1]).to.have.property('identifier').that.equals('BAR')
      expect(tokenDefs[1]).to.have.property('pattern').that.equals('bar')
      expect(tokenDefs[2]).to.have.property('identifier').that.equals('BAZ')
      expect(tokenDefs[2]).to.have.property('pattern').that.equals('baz')
    })

    it(`should contain TokenDefinition objects with passed flags`, function () {
      const dialect = createDialect(
        ['FOO', 'foo', {ignoreCase: true}]
      )

      expect(dialect.tokenDefinitions[0])
        .to.have.property('flags')
        .that.deep.equals({ignoreCase: true})
    })
  })
})
