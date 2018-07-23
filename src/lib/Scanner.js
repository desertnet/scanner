import Dialect from './Dialect'
import Token from './Token'

export default class Scanner {
  constructor (subject) {
    if (!subject) {
      throw new TypeError(`Expected subject parameter to Scanner constructor`)
    }

    this.subject = subject
    this.position = 0
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
      yield new Token(identifier, this.subject.slice(this.position, endOffset), this.position)
      this.position = endOffset
    }
  }
}
