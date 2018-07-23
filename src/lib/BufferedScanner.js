import Scanner from './Scanner'
import BufferedTokenizer from './BufferedTokenizer'
import TokenizerCache from './TokenizerCache'
import maxBy from 'lodash.maxby'

const tokenizerCache = new TokenizerCache(
  dialect => new BufferedTokenizer(dialect.tokenDefinitions)
)

export default class BufferedScanner extends Scanner {
  constructor (subject) {
    super(subject)
  }

  determineNextTokenUsingDialect (dialect) {
    if (this.position >= this.subject.length) return null

    const tokenizer = tokenizerCache.tokenizerForDialect(dialect)
    tokenizer.subject = this.subject

    const candidateTokens = tokenizer.findTokensAt(this.position)
    return maxBy(candidateTokens, tok => tok.value.length)
  }
}
