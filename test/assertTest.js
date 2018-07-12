import {expect} from 'chai'

import assert from '../src/lib/assert'

describe(`assert()`, function () {
  const mockScanner = { _source:"Bar" }

  it(`should not throw if passed value is truthy`, function () {
    expect(() => assert(1, "Foo", mockScanner)).not.throw()
  })

  it(`should throw if passed value is falsey`, function () {
    expect(() => assert(0, "Foo", mockScanner)).throw(/Foo/)
  })
})
