import ScannerError from './ScannerError'

export default function assert (value, message, context) {
  if (!value) {
    throw new ScannerError(message, context)
  }
}
