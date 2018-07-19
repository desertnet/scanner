import TokenDefinition from './TokenDefinition'

const tokenDefsSym = Symbol('tokensDef')

export default class Dialect {
  constructor (identifier) {
    this.identifier = identifier
    this[tokenDefsSym] = new Set()
  }

  addTokenDefinition (definition) {
    if (!(definition instanceof TokenDefinition)) {
      throw new TypeError(`Expected TokenDefinition`)
    }
    this[tokenDefsSym].add(definition)
  }

  get tokenDefinitions () {
    return [...this[tokenDefsSym]]
  }
}
