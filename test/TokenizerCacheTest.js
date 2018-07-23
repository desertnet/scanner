import sinon from 'sinon'
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'

import TokenizerCache from '../src/lib/TokenizerCache'

chai.use(sinonChai)

describe(`TokenizerCache`, function () {
  describe(`instance property`, function () {
    let tokenizerCache, tokenizerCreator, tokenizer

    beforeEach(function () {
      tokenizer = {}
      tokenizerCreator = sinon.stub().returns(tokenizer)
      tokenizerCache = new TokenizerCache(tokenizerCreator)
    })

    describe(`tokenizerForDialect()`, function () {
      let dialect

      beforeEach(function () {
        dialect = {}
      })

      it(`should call createTokenizerForDialect on first call`, function () {
        tokenizerCache.tokenizerForDialect(dialect)
        tokenizerCache.tokenizerForDialect(dialect)
        expect(tokenizerCreator).to.have.been.calledOnce
      })

      it(`should return same tokenizer object for every call`, function () {
        const result1 = tokenizerCache.tokenizerForDialect(dialect)
        const result2 = tokenizerCache.tokenizerForDialect(dialect)
        expect(result1).to.equal(result2)
      })
    })
  })
})
