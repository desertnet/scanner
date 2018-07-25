import {expect} from 'chai'

import {TokenDefinition} from '../src'

describe(`TokenDefinition`, function () {
  describe(`constructor()`, function () {
    it(`should set the identifier property`, function () {
      const myToken = Symbol('myToken')
      expect(new TokenDefinition(myToken, 'foo')).to.have.property('identifier', myToken)
    })

    it(`should set the pattern property`, function () {
      expect(new TokenDefinition('t', 'foo')).to.have.property('pattern', 'foo')
    })

    it(`should throw when passed a non string as a pattern`, function () {
      expect(() => new TokenDefinition('tok', /re/)).to.throw(TypeError)
    })

    it(`should throw an error when passed pattern is invalid RegExp syntax`, function () {
      const foo = Symbol('foo')
      expect(() => new TokenDefinition(foo, '(bar')).to.throw(/foo.*invalid.*\(bar/i)
    })

    it(`should throw when passed non-object as flags`, function () {
      expect(() => new TokenDefinition('tok', 'foo', 9)).to.throw(TypeError)
    })

    it(`should set the flags property`, function () {
      const flags = {ignoreCase: true}
      expect(new TokenDefinition('tok', 'foo', flags))
        .to.have.property('flags')
        .that.equals(flags)
    })
  })
})
