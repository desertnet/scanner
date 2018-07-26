// Adapted from getWholeCharAndI() implementation:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt

export default function wholeCharLength (str, i) {
  var code = str.charCodeAt(i)

  // High surrogate (could change last hex to 0xDB7F to treat high private
  // surrogates as single characters)
  if (0xD800 <= code && code <= 0xDBFF) {
    if (str.length <= (i + 1)) {
      return 1
    }

    var next = str.charCodeAt(i + 1)
    if (0xDC00 > next || next > 0xDFFF) {
      return 1
    }

    return 2
  }

  return 1
}
