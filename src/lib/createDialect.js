import isPlainObject from 'lodash.isplainobject'

import Dialect from './Dialect'
import TokenDefinition from './TokenDefinition'

export default function createDialect (tokenDefs) {
  if (!isPlainObject(tokenDefs)) {
    throw new TypeError(`Expected plain object for parameter to createDialect()`)
  }

  return new Dialect(
    Object.keys(tokenDefs).map(
      identifier => {
        const value = tokenDefs[identifier]
        const params = Array.isArray(value) ? value : [value]
        return new TokenDefinition(identifier, ...params)
      }
    )
  )
}
