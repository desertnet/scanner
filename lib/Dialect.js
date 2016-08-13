/**
 * A collection of token descriptor objects.
 * @constructor
 * @private
 * @param {string} name
 * @param {Array.<TokenDescriptor>} descriptors
 */
export default class Dialect {
  constructor (name, descriptors) {
    /**
     * @private
     * @type {string}
     */
    this._name = name;

    /**
     * @private
     * @type {Array.<TokenDescriptor>}
     */
    this._descriptors = descriptors;

    /**
     * @private
     * @type {Object.<string,TokenDescriptor>|null}
     */
    this._descriptorsHash = null;
  }

  /**
   * @private
   * @return {string}
   */
  name () {
    return this._name;
  }

  /**
   * @private
   * @return {Array.<TokenDescriptor>}
   */
  descriptors () {
    return this._descriptors;
  }

  /**
   * Grab a token decriptor by type name.
   * @protected
   * @param {string} type
   * @return {TokenDescriptor}
   */
  getDescriptor (type) {
    // Initialize the descriptors hash if it isn't already defiend. This
    // just makes descriptor lookups fast.
    if (!this._descriptorsHash) {
      this._descriptorsHash = {};
      for (var i = 0; i < this._descriptors.length; i++) {
        var descriptor = this._descriptors[i];
        this._descriptorsHash[descriptor.type] = descriptor;
      }
    }

    return this._descriptorsHash[type] || null;
  }
}
