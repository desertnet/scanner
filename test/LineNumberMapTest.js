import {expect} from 'chai'

import LineNumberMap from '../src/lib/LineNumberMap'

describe(`LineNumberMap`, function () {
  describe(`instance property`, function () {
    let lineNumberMap

    context(`when no extra chunks are added`, function () {
      beforeEach(function () {
        lineNumberMap = new LineNumberMap(`one\ntwo\nthree\nfour\nfive`)
      })
      getLineNumberForOffsetTests(lineNumberMap)
      getColumnForOffsetTests(lineNumberMap)
    })

    context(`when extra chunks are added`, function () {
      beforeEach(function () {
        lineNumberMap = new LineNumberMap(`one\ntwo\nthr`)
        lineNumberMap.addChunk(`ee\nfour\nfive`)
      })
      getLineNumberForOffsetTests(lineNumberMap)
      getColumnForOffsetTests(lineNumberMap)
    })

    function getLineNumberForOffsetTests () {
      describe(`getLineNumberForOffset()`, function () {
        it(`should return the correct line number`, function () {
          expect(lineNumberMap.getLineNumberForOffset(0)).to.equal(1)
          expect(lineNumberMap.getLineNumberForOffset(1)).to.equal(1)
          expect(lineNumberMap.getLineNumberForOffset(4)).to.equal(2)
          expect(lineNumberMap.getLineNumberForOffset(9)).to.equal(3)
          expect(lineNumberMap.getLineNumberForOffset(14)).to.equal(4)
          expect(lineNumberMap.getLineNumberForOffset(20)).to.equal(5)
        })
      })
    }

    function getColumnForOffsetTests () {
      describe(`getColumnForOffset()`, function () {
        it(`should return the correct column number`, function () {
          expect(lineNumberMap.getColumnForOffset(0)).to.equal(1)
          expect(lineNumberMap.getColumnForOffset(1)).to.equal(2)
          expect(lineNumberMap.getColumnForOffset(3)).to.equal(4)
          expect(lineNumberMap.getColumnForOffset(4)).to.equal(1)
          expect(lineNumberMap.getColumnForOffset(6)).to.equal(3)
          expect(lineNumberMap.getColumnForOffset(8)).to.equal(1)
          expect(lineNumberMap.getColumnForOffset(15)).to.equal(2)
          expect(lineNumberMap.getColumnForOffset(20)).to.equal(2)
        })
      })
    }
  })
})
