import TokenDefinition from './TokenDefinition'

const regexesSym = Symbol('regexes')

export default class BufferedRegExpTokenizer {
  constructor (tokenDefinitions) {
    if (tokenDefinitions === undefined) {
      throw new TypeError(`Missing tokenDefinitions argument`)
    }

    if (!Array.isArray(tokenDefinitions)) {
      throw new TypeError(`Expected array`)
    }

    this[regexesSym] = new Map()
    for (const tokenDef of tokenDefinitions) {
      if (!(tokenDef instanceof TokenDefinition)) {
        throw new TypeError(`Expected TokenDefinition`)
      }

      const flags = `gumy${tokenDef.flags.ignoreCase ? 'i' : ''}`
      this[regexesSym].set(tokenDef, new RegExp(tokenDef.pattern, flags))
    }
  }

  findTokensAt (subject, offset) {
    const tokens = []

    for (const [tokenDef, regex] of this[regexesSym]) {
      regex.lastIndex = offset
      if (regex.test(subject)) {
        tokens.push([tokenDef.identifier, regex.lastIndex])
      }
    }

    return tokens
  }
}
