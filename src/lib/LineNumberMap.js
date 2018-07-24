import {IntervalTree} from 'node-interval-tree'

export default class LineNumberMap {
  constructor (initialChunk) {
    this.offset = 0
    this.lineNumber = 1
    this.intervalTree = new IntervalTree()
    this.addChunk(initialChunk)
  }

  addChunk (chunk) {
    const lineRe = /.*?(?:\r\n|\r|\n)/gy

    let lastLineStart = 0
    while (lineRe.test(chunk)) {
      this.intervalTree.insert({
        low: lastLineStart + this.offset,
        high: lineRe.lastIndex - 1 + this.offset,
        lineno: this.lineNumber,
      })
      lastLineStart = lineRe.lastIndex
      this.lineNumber += 1
    }

    this.offset += lastLineStart
  }

  getLineNumberForOffset (offset) {
    const intervals = this.intervalTree.search(offset, offset)
    if (intervals.length === 0) return this.lineNumber
    return intervals[0].lineno
  }

  getColumnForOffset (offset) {
    const intervals = this.intervalTree.search(offset, offset)
    if (intervals.length === 0) return offset - this.offset + 1
    return offset - intervals[0].low + 1
  }
}
