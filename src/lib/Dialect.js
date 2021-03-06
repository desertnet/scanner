import TokenDefinition from './TokenDefinition'

const tokenDefsSym = Symbol('tokensDef')

export default class Dialect {
  constructor (tokenDefs) {
    if (!Array.isArray(tokenDefs)) {
      throw new TypeError(`Expected array of token definitions`)
    }

    if (tokenDefs.length === 0) {
      throw new TypeError(`Expected non-empty array of token definitions`)
    }

    for (const tokenDef of tokenDefs) {
      if (!(tokenDef instanceof TokenDefinition)) {
        throw new TypeError(`Expected TokenDefinition`)
      }
    }

    this[tokenDefsSym] = new Set(tokenDefs)
  }

  get tokenDefinitions () {
    return [...this[tokenDefsSym]]
  }
}
