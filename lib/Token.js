export default class Token {
  /**
   * @param {string} type
   * @param {string} value
   * @param {number} index
   * @param {number} line
   * @param {number} column
   */
  constructor (type, value, index, line, column) {
    /** @type {string} */ this.type = type;
    /** @type {string} */ this.value = value;
    /** @type {number} */ this.index = index;
    /** @type {number} */ this.line = line;
    /** @type {number} */ this.column = column;
  }
}
