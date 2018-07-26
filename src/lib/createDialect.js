import Dialect from './Dialect'
import TokenDefinition from './TokenDefinition'

export default function createDialect (...tokenDefs) {
  return new Dialect(
    tokenDefs.map(def => new TokenDefinition(...def))
  )
}
