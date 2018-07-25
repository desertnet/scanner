import {expect} from 'chai'

import {BufferedRegExpTokenizer, TokenDefinition} from '../src'

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
    let tokenizer

    beforeEach(function () {
      const r = String.raw
      tokenizer = new BufferedRegExpTokenizer([
        new TokenDefinition('WHITESPACE',  r`\s+`),
        new TokenDefinition('IF',          r`if`,      {ignoreCase: true}),
        new TokenDefinition('THEN',        r`then`),
        new TokenDefinition('ENDIF',       r`endif`),
        new TokenDefinition('BLOCK START', r`\{`),
        new TokenDefinition('BLOCK END',   r`\}`),
        new TokenDefinition(`COMMENT`,     r`//.*?(?:\r\n|\r|\n)`),
        new TokenDefinition(`DIVIDE`,      r`/`),
        new TokenDefinition(`DEREF`,       r`\*`),
        new TokenDefinition(`COMMENT`,     r`/\*.*?\*/`),
      ])
    })

    describe(`findTokensAt()`, function () {
      it(`should return an empty array when there is no matching token definition`, function () {
        expect(tokenizer.findTokensAt({subject:'foo', offset:0})).to.deep.equal([])
      })

      it(`should ignore case regex when ignoreCase is specified on token definition`, function () {
        tokenizer.subject = 'IF THEN'
        expect(tokenizer.findTokensAt(0))
          .to.deep.equal([['IF', 2]])
      })

      it(`should match a token at start of string`, function () {
        tokenizer.subject = 'if then'
        expect(tokenizer.findTokensAt(0))
          .to.deep.equal([['IF', 2]])
      })

      it(`should match token at start of offset`, function () {
        tokenizer.subject = 'if then'
        expect(tokenizer.findTokensAt(3))
          .to.deep.equal([['THEN', 7]])
      })

      it(`should match multiple tokens when more than one defintion matches`, function () {
        tokenizer.subject = 'a/*b /* comment */'
        expect(tokenizer.findTokensAt(1))
          .to.deep.equal([
            ['DIVIDE', 2],
            ['COMMENT', 18],
          ])
      })
    })
  })
})
