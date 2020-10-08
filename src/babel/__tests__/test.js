const babel = require('@babel/core')
const path = require('path')
const fs = require('fs')
const plugin = require('../index')

function transform(input, platform, extra = {}) {
  const { code } = babel.transform(input, {
    configFile: false,
    plugins: ['@babel/plugin-syntax-jsx', [plugin, { platform, ...extra }]],
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
      'not allowed to pass `className`',
    )
    expect(() => transform(example('classNameNotAllowed'), 'native')).toThrow(
      'not allowed to pass `className`',
    )
  })
  it('style in components not allowed', () => {
    expect(() => transform(example('styleNotAllowed'), 'web')).toThrow(
      'not allowed to pass `style`',
    )
    expect(() => transform(example('styleNotAllowed'), 'native')).toThrow(
      'not allowed to pass `style`',
    )
  })
  it(`doesn't add __zacs_original_name in production`, () => {
    expect(transform(example('production'), 'web', { production: true })).toMatchSnapshot()
  })
  it(`preserves declarations if requested`, () => {
    expect(
      transform(example('production'), 'web', { production: true, keepDeclarations: true }),
    ).toMatchSnapshot()
  })
  it(`exporting declarations not alowed`, () => {
    expect(() => transform(example('exportingDeclarationsNotAllowed'), 'web')).toThrow(
      'not allowed to export zacs declarations',
    )
  })
  it(`declarations must be assigned to a variable`, () => {
    expect(() => transform(`const {Foo} = zacs.view()`, 'web')).toThrow(
      'Expected zacs declaration to be assigned to a simple variable',
    )
  })
  it(`complains about duplicate declaration names`, () => {
    expect(() => transform(`const Foo = zacs.view(); { const Foo = zacs.text() }`, 'web')).toThrow(
      'Duplicate ZACS declaration for name: Foo',
    )
  })
  it(`imports are validated`, () => {
    const badForms = [
      `import Zacs from '@nozbe/zacs'`,
      `import {text,createView} from '@nozbe/zacs'`,
      `import * as zacs from '@nozbe/zacs'`,
      `import ZACS from 'zacs'`,
    ]
    badForms.forEach(js => {
      // console.log(js)
      expect(() => transform(js, 'web')).toThrow('ZACS import must say exactly')
    })
  })
  it(`transforms experimental stylesheets`, () => {
    expect(transform(example('stylesheet'), 'web')).toMatchSnapshot()
  })
})
