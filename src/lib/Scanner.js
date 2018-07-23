import Dialect from './Dialect'

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

    let token
    while ((token = this.determineNextTokenUsingDialect(dialect))) {
      this.position = this.position + token.value.length
      yield token
    }
  }
}
