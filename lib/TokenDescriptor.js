/**
 * @private
 * @constructor
 * @param {string} type
 * @param {RegExp} regex
 */
export default class TokenDescriptor {
  constructor (type, regex) {
    this.type = type;

    // Normalize regex flags.
    var flags = "gm";
    if (regex.ignoreCase) flags += "i";

    this.regex = new RegExp(regex.source, flags);
  }
}
