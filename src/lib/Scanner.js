import Dialect from './Dialect'
import Token from './Token'
import LineNumberMap from './LineNumberMap'

const lineNumberMapProp = Symbol('lineNumberMapProp')

export default class Scanner {
  constructor (subject) {
    if (!subject) {
      throw new TypeError(`Expected subject parameter to Scanner constructor`)
    }

    this.subject = subject
    this.position = 0
    this[lineNumberMapProp] = null
  }

  get lineNumberMap () {
    if (this[lineNumberMapProp] === null) {
      this[lineNumberMapProp] = new LineNumberMap(this.subject)
    }
    return this[lineNumberMapProp]
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
      const [identifier, endOffset] = tok
      const token = new Token({
        scanner: this,
        type: identifier,
        start: this.position,
        end: endOffset,
      })
      this.position = endOffset
      yield token
    }
  }
}
