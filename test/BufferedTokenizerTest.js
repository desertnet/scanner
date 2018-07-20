import {expect} from 'chai'

import {BufferedTokenizer, TokenDefinition, Token} from '../src'

describe(`BufferedTokenizer`, function () {
  describe(`constructor()`, function () {
    it(`should throw when passed nothing`, function () {
      expect(() => new BufferedTokenizer()).to.throw(TypeError)
    })

    it(`should throw when passed anything other than an array`, function () {
      expect(() => new BufferedTokenizer('foo')).to.throw(TypeError)
    })

    it(`should throw when passed an array that is not completely TokenDefinitions`, function () {
      const tokenDefinitions = [new TokenDefinition('foo', 'foo'), 'bar']
      expect(() => new BufferedTokenizer(tokenDefinitions)).to.throw(TypeError)
    })
  })

  describe(`instance property`, function () {
    let tokenizer

    beforeEach(function () {
      const r = String.raw
      tokenizer = new BufferedTokenizer([
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
          .to.deep.equal([ new Token('IF', 'IF', 0) ])
      })

      it(`should match a token at start of string`, function () {
        tokenizer.subject = 'if then'
        expect(tokenizer.findTokensAt(0))
          .to.deep.equal([ new Token('IF', 'if', 0) ])
      })

      it(`should match token at start of offset`, function () {
        tokenizer.subject = 'if then'
        expect(tokenizer.findTokensAt(3))
          .to.deep.equal([ new Token('THEN', 'then', 3) ])
      })

      it(`should match multiple tokens when more than one defintion matches`, function () {
        tokenizer.subject = 'a/*b /* comment */'
        expect(tokenizer.findTokensAt(1))
          .to.deep.equal([
            new Token('DIVIDE', '/', 1),
            new Token('COMMENT', '/*b /* comment */', 1)
          ])
      })
    })
  })
})
