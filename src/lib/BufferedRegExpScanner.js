import Scanner, {EOF} from './Scanner'
import BufferedRegExpTokenizer from './BufferedRegExpTokenizer'
import TokenizerCache from './TokenizerCache'
import maxBy from 'lodash.maxby'

const tokenizerCache = new TokenizerCache(
  dialect => new BufferedRegExpTokenizer(dialect.tokenDefinitions)
)

export default class BufferedRegExpScanner extends Scanner {
  determineNextTokenUsingDialect (dialect) {
    if (this.position >= this.subject.length) return [EOF]

    const tokenizer = tokenizerCache.tokenizerForDialect(dialect)

    return maxBy(tokenizer.findTokensAt(this.subject, this.position), tok => tok[1])
  }
}
