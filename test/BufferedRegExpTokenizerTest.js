import {expect} from 'chai'

import {TokenDefinition} from '../src'
import BufferedRegExpTokenizer from '../src/lib/BufferedRegExpTokenizer'

describe(`BufferedRegExpTokenizer`, function () {
  describe(`constructor()`, function () {
    it(`should throw when passed nothing`, function () {
      expect(() => new BufferedRegExpTokenizer()).to.throw(TypeError)
    })

    it(`should throw when passed anything other than an array`, function () {
      expect(() => new BufferedRegExpTokenizer('foo')).to.throw(TypeError)
    })

    it(`should throw when passed an array that is not completely TokenDefinitions`, function () {
      const tokenDefinitions = [new TokenDefinition('foo', 'foo'), 'bar']
      expect(() => new BufferedRegExpTokenizer(tokenDefinitions)).to.throw(TypeError)
    })
  })

  describe(`instance property`, function () {
    let tokenizer, definitions

    beforeEach(function () {
      const r = String.raw
      definitions = [
        new TokenDefinition('WHITESPACE',  r`\s+`),
        new TokenDefinition('IF',          r`if`,      {ignoreCase: true}),
        new TokenDefinition('THEN',        r`then`),
        new TokenDefinition('ENDIF',       r`endif`),
        new TokenDefinition('BLOCK START', r`\{`),
        new TokenDefinition('BLOCK END',   r`\}`),
        new TokenDefinition(`EOL COMMENT`, r`//.*?(?:\r\n|\r|\n)`),
        new TokenDefinition(`DIVIDE`,      r`/`),
        new TokenDefinition(`DEREF`,       r`\*`),
        new TokenDefinition(`COMMENT`,     r`/\*.*?\*/`),
      ]
      tokenizer = new BufferedRegExpTokenizer(definitions)
    })

    function defForId (identifier) {
      return definitions.find(definition => identifier === definition.identifier)
    }

    describe(`findTokensAt()`, function () {
      it(`should return an empty array when there is no matching token definition`, function () {
        expect(tokenizer.findTokensAt({subject:'foo', offset:0})).to.deep.equal([])
      })

      it(`should ignore case regex when ignoreCase is specified on token definition`, function () {
        expect(tokenizer.findTokensAt('IF THEN', 0))
          .to.deep.equal([[defForId('IF'), 2]])
      })

      it(`should match a token at start of string`, function () {
        expect(tokenizer.findTokensAt('if then', 0))
          .to.deep.equal([[defForId('IF'), 2]])
      })

      it(`should match token at start of offset`, function () {
        expect(tokenizer.findTokensAt('if then', 3))
          .to.deep.equal([[defForId('THEN'), 7]])
      })

      it(`should match multiple tokens when more than one defintion matches`, function () {
        expect(tokenizer.findTokensAt('a/*b /* comment */', 1))
          .to.deep.equal([
            [defForId('DIVIDE'), 2],
            [defForId('COMMENT'), 18],
          ])
      })
    })
  })
})
