const scannerProp = Symbol('scannerProp')
const definitionProp = Symbol('definitionProp')
const typeProp = Symbol('typeProp')
const startProp = Symbol('startProp')
const endProp = Symbol('endCacheProp')

export default class Token {
  constructor ({scanner, definition, type, start, end}) {
    this[scannerProp] = scanner
    this[definitionProp] = definition
    this[typeProp] = type
    this[startProp] = start
    this[endProp] = end
  }

  get scanner () { return this[scannerProp] }
  get definition () { return this[definitionProp] }
  get type () { return this[typeProp] || this[definitionProp].identifier }
  get start () { return this[startProp] }
  get end () { return this[endProp] }

  get value () {
    return this.scanner.subject.slice(this.start, this.end)
  }

  get line () {
    return this.scanner.lineNumberForOffset(this.start)
  }

  get column () {
    return this.scanner.columnNumberForOffset(this.start)
  }

  toString () {
    const value = this.value
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/'/g, '\\\'')
    return `{ type: ${this.type.toString()}, start: ${this.start}, end: ${this.end}, line: ${this.line}, column: ${this.column}, value: '${value}' }`
  }
}
