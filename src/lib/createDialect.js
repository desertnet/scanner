import isPlainObject from 'lodash.isplainobject'

import Dialect from './Dialect'
import TokenDefinition from './TokenDefinition'

export default function createDialect (tokenDefs) {
  if (!isPlainObject(tokenDefs)) {
    throw new TypeError(`Expected plain object for parameter to createDialect()`)
  }

  let lastType
  Reflect.ownKeys(tokenDefs).forEach(tokenType => {
    const curType = typeof tokenType
    if (lastType && lastType !== curType) {
      throw new TypeError(`You may not mix types of token type identifiers. Use only Symbols or only strings.`)
    }
    lastType = curType
  })

  return new Dialect(
    Reflect.ownKeys(tokenDefs).map(
      identifier => {
        const value = tokenDefs[identifier]
        const params = Array.isArray(value) ? value : [value]
        return new TokenDefinition(identifier, ...params)
      }
    )
  )
}
