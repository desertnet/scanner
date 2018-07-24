const scannerProp = Symbol('scannerProp')
const typeProp = Symbol('typeProp')
const startProp = Symbol('startProp')
const endProp = Symbol('endCacheProp')

export default class Token {
  constructor ({scanner, type, start, end}) {
    this[scannerProp] = scanner
    this[typeProp] = type
    this[startProp] = start
    this[endProp] = end
  }

  get scanner () { return this[scannerProp] }
  get type () { return this[typeProp] }
  get start () { return this[startProp] }
  get end () { return this[endProp] }

  get value () {
    return this.scanner.subject.slice(this.start, this.end)
  }

  get line () {
    return this.scanner.lineNumberMap.getLineNumberForOffset(this.start)
  }

  get column () {
    return this.scanner.lineNumberMap.getColumnForOffset(this.start)
  }
}
