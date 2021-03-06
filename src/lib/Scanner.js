import isString from 'lodash.isstring'

import Dialect from './Dialect'
import Token from './Token'
import LineNumberMap from './LineNumberMap'
import wholeCharLength from './wholeCharLength'
import TokenDefinition from './TokenDefinition'

const lineNumberMapProp = Symbol('lineNumberMapProp')
const lineNumberMapAccessor = Symbol('lineNumberMapAccessor')

export const EOF = Symbol('EOF')
export const UnexpectedCharacter = Symbol('UnexpectedCharacter')
const unexpectedCharacterDefinition = new TokenDefinition(UnexpectedCharacter, '.')

export default class Scanner {
  constructor (subject) {
    if (subject === undefined) {
      throw new TypeError(`Expected subject parameter to Scanner constructor`)
    }

    if (!isString(subject)) {
      throw new TypeError(`Expected subject paramter to be a string`)
    }

    this.subject = subject
    this.position = 0
    this[lineNumberMapProp] = null
  }

  determineNextTokenUsingDialect () {
    throw new Error(`determineNextTokenUsingDialect must be overridden by subclass`)
  }

  *generateTokensUsingDialect (dialect) {
    if (!dialect) {
      throw new TypeError(`Expected dialect argument`)
    }

    if (!(dialect instanceof Dialect)) {
      throw new TypeError(`Expected dialect arguement to be a Dialect`)
    }

    let tok
    while ((tok = this.determineNextTokenUsingDialect(dialect))) {
      const [definition, endOffset] = tok

      if (definition === EOF) return

      const typeOrDef = tok[0] instanceof TokenDefinition ? 'definition' : 'type'
      const token = new Token({
        scanner: this,
        [typeOrDef]: definition,
        start: this.position,
        end: endOffset,
      })

      this.position = endOffset
      yield token
    }

    // If we got here it means determineNextTokenUsingDialect() could not
    // match the next character.
    return new Token({
      scanner: this,
      definition: unexpectedCharacterDefinition,
      start: this.position,
      end: this.position + wholeCharLength(this.subject, this.position),
    })
  }

  get [lineNumberMapAccessor] () {
    if (this[lineNumberMapProp] === null) {
      this[lineNumberMapProp] = new LineNumberMap(this.subject)
    }
    return this[lineNumberMapProp]
  }

  lineNumberForOffset (offset) {
    return this[lineNumberMapAccessor].getLineNumberForOffset(offset)
  }

  columnNumberForOffset (offset) {
    return this[lineNumberMapAccessor].getColumnForOffset(offset)
  }
}
