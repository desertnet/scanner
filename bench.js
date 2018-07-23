#!/usr/bin/env node

const {BufferedScanner, Dialect, TokenDefinition} = require('./dist')
// import {BufferedScanner, Dialect, TokenDefinition} from './src'

const length = 100000
const subject = Array(length).fill(`if (this) then {that}`, 0, length).join(' ')

const myLang = new Dialect('myLang', [
  new TokenDefinition('IF', String.raw`if`),
  new TokenDefinition('THIS', String.raw`this`),
  new TokenDefinition('THEN', String.raw`then`),
  new TokenDefinition('SPACE', String.raw`\s+`),
  new TokenDefinition('LPAREN', String.raw`\(`),
  new TokenDefinition('RPAREN', String.raw`\)`),
  new TokenDefinition('LBRACE', String.raw`\{`),
  new TokenDefinition('RBRACE', String.raw`\}`),
  new TokenDefinition('VAR', String.raw`\w+`),
])

const scanner = new BufferedScanner(subject)

console.log(`scanning ${Math.floor(subject.length / 1024)}KB equivalent file`)

const t0 = Date.now()
for (const _tok of scanner.generateTokensUsingDialect(myLang)) {
  /* nada */
}
console.log(`${Date.now() - t0}ms`)

/* eslint no-console: off */
