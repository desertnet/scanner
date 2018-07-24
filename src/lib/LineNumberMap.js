import {IntervalTree} from 'node-interval-tree'

export default class LineNumberMap {
  constructor (initialChunk) {
    this.lastLineStart = 0
    this.lastLineLengthFromPrevChunks = 0
    this.lineNumber = 1
    this.intervalTree = new IntervalTree()
    this.addChunk(initialChunk)
  }

  addChunk (chunk) {
    const lineRe = /.*?(?:\r\n|\r|\n)/gy
    lineRe.lastIndex = 0

    let match, lastLineOffsetInChunk = 0
    while ((match = lineRe.exec(chunk))) {
      this.intervalTree.insert({
        low: this.lastLineStart,
        high: this.lastLineStart + this.lastLineLengthFromPrevChunks + match[0].length - 1,
        lineno: this.lineNumber,
      })

      lastLineOffsetInChunk = match.index + match[0].length
      this.lastLineStart += this.lastLineLengthFromPrevChunks + match[0].length
      this.lastLineLengthFromPrevChunks = 0
      this.lineNumber += 1
    }

    this.lastLineLengthFromPrevChunks += chunk.length - lastLineOffsetInChunk
  }

  getLineNumberForOffset (offset) {
    const intervals = this.intervalTree.search(offset, offset)
    if (intervals.length === 0) return this.lineNumber
    return intervals[0].lineno
  }

  getColumnForOffset (offset) {
    const intervals = this.intervalTree.search(offset, offset)
    if (intervals.length === 0) return offset - this.lastLineStart + 1
    return offset - intervals[0].low + 1
  }
}
