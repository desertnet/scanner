import isString from 'lodash.isstring'

export default class TokenDefinition {
  constructor (identifier, pattern, flags = {}) {
    if (!isString(pattern)) {
      throw new TypeError(`Expected string for pattern parameter`)
    }

    try { new RegExp(pattern) }
    catch (err) {
      throw new Error(`Token definition ${identifier.toString()} pattern: ${err.message}`)
    }

    if ('ignoreCase' in flags) {
      if (flags.ignoreCase !== true && flags.ignoreCase !== false) {
        throw new TypeError(`Incorrect type for ignoreCase flag, expected boolean`)
      }
    }

    this.identifier = identifier
    this.pattern = pattern
    this.ignoreCase = flags.ignoreCase ? true : false
  }
}
