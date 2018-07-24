import {expect} from 'chai'

import LineNumberMap from '../src/lib/LineNumberMap'

describe(`LineNumberMap`, function () {
  describe(`instance property`, function () {
    describe(`getLineNumberForOffset()`, function () {
      it(`should return the correct line number`, function () {
        const lineNumberMap = new LineNumberMap(`one\ntwo\nthree\nfour\nfive`)
        expect(lineNumberMap.getLineNumberForOffset(0)).to.equal(1)
        expect(lineNumberMap.getLineNumberForOffset(1)).to.equal(1)
        expect(lineNumberMap.getLineNumberForOffset(4)).to.equal(2)
        expect(lineNumberMap.getLineNumberForOffset(20)).to.equal(5)
      })
    })
  })
})
