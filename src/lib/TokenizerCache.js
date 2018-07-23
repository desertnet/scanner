export default class TokenizerCache {
  constructor (tokenizerCreator) {
    this.tokenizerCreator = tokenizerCreator
    this.cache = new WeakMap()
  }

  tokenizerForDialect (dialect) {
    let tokenizer = this.cache.get(dialect)
    if (!tokenizer) {
      tokenizer = (this.tokenizerCreator)(dialect)
      this.cache.set(dialect, tokenizer)
    }
    return tokenizer
  }
}
