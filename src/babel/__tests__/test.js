const babel = require('@babel/core')
const path = require('path')
const fs = require('fs')
const plugin = require('../')

function transform(input, platform, production = false) {
  const { code } = babel.transform(input, {
    configFile: false,
    plugins: ['@babel/plugin-syntax-jsx', [plugin, { platform, production }]],
  })
  return code
}

function example(name) {
  return fs.readFileSync(path.resolve(__dirname, 'examples', `${name}.js`)).toString()
}

describe('zacs', () => {
  it('works with the basic example on web', () => {
    expect(transform(example('basic'), 'web')).toMatchSnapshot()
  })
  it('works with the basic example on native', () => {
    expect(transform(example('basic'), 'native')).toMatchSnapshot()
  })
  it('className in components not allowed', () => {
    expect(() => transform(example('classNameNotAllowed'), 'web')).toThrow(
      /not allowed to pass `className`/,
    )
    expect(() => transform(example('classNameNotAllowed'), 'native')).toThrow(
      /not allowed to pass `className`/,
    )
  })
  it('style in components not allowed', () => {
    expect(() => transform(example('styleNotAllowed'), 'web')).toThrow(
      /not allowed to pass `style`/,
    )
    expect(() => transform(example('styleNotAllowed'), 'native')).toThrow(
      /not allowed to pass `style`/,
    )
  })
  it(`doesn't add __zacs_original_name in production`, () => {
    expect(transform(example('production'), 'web', true)).toMatchSnapshot()
  })
  it(`exporting declarations not alowed`, () => {
    expect(() => transform(example('exportingDeclarationsNotAllowed'), 'web')).toThrow(
      /not allowed to export zacs declarations/,
    )
  })
})
