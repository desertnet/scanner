import isString from 'lodash.isstring'
import isPlainObject from 'lodash.isplainobject'

export default class TokenDefinition {
  constructor (identifier, pattern, flags = {}) {
    if (!isString(pattern)) {
      throw new TypeError(`Expected string for pattern parameter`)
    }

    try { new RegExp(pattern) }
    catch (err) {
      throw new Error(`Token definition ${identifier.toString()} pattern: ${err.message}`)
    }

    if (!isPlainObject(flags)) {
      throw new TypeError(`Expected plain object for flags paramter`)
    }

    this.identifier = identifier
    this.pattern = pattern
    this.flags = flags
  }
}
