/**
 * @public
 * @extends {Error}
 * @param {string} message
 * @param {Scanner} scanner
 */
export default class ScannerError extends Error {
	constructor (message, scanner) {
	  super(message);
	  this.name = "ScannerError";
	  this.sourceString = scanner._source;
	  this.index = scanner._pos;
	  this.line = scanner._line;
	  this.column = scanner._column;
	}
}
