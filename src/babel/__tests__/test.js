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
  it(`transforms experimental stylesheets (web)`, () => {
    expect(transform(example('stylesheet'), 'web')).toMatchSnapshot()
  })
  it(`transforms experimental stylesheets (native)`, () => {
    expect(transform(example('stylesheet'), 'native')).toMatchSnapshot()
  })
  it(`transforms experimental stylesheets (native, ios)`, () => {
    expect(transform(example('stylesheet'), 'native', { target: 'ios' })).toMatchSnapshot()
  })
  it(`transforms experimental stylesheets (native, android)`, () => {
    expect(transform(example('stylesheet'), 'native', { target: 'android' })).toMatchSnapshot()
  })
  it(`throw an error on illegal stylesheets`, () => {
    const bad = (syntax, error) =>
      expect(() => transform(`const _ = zacs._experimentalStyleSheet(${syntax})`, 'web')).toThrow(
        error,
      )

    bad('', 'single Object')
    bad('[]', 'single Object')
    bad('styles', 'single Object')

    bad('{"foo":{}}', 'name: {}')
    bad('{[name]:{}}', 'name: {}')
    bad('{foo}', 'name: {}')
    bad('{foo(){}}', 'name: {}')
    bad('{a:{},...styles}', 'name: {}')
    bad('{get b(){}}', 'name: {}')

    bad('{a: 0}', 'object literal')
    bad('{a: x?{}:{}}', 'object literal')
    bad('{a: styles}', 'object literal')
    bad('{a: []}', 'object literal')
    bad('{a: ""}', 'object literal')

    bad('{css: {}}', 'magic css:')

    bad('{a: {[name]:0}}', 'simple strings')
    bad('{a: {foo:0,...styles}}', 'simple strings')
    bad('{a: {foo}}', 'simple strings')
    bad('{a: {"foo":0}}', 'web inner styles')

    bad('{a: {css:null}}', 'magic css:')
    bad('{a: {css:predefinedCss}}', 'magic css:')
    bad('{a: {css:{}}}', 'magic css:')
    // eslint-disable-next-line no-template-curly-in-string
    bad('{a: {css:`foo${bar}`}}', 'magic css:')

    bad('{a: {web:{foo}}}', 'simple strings')
    bad('{a: {native:{...styles}}}', 'simple strings')
    bad('{a: {ios:{foo}}}', 'simple strings')
    bad('{a: {android:{foo}}}', 'simple strings')

    bad('{a: { width: width }}', 'strings or numbers')
    bad('{a: { width: platform ? 10 : 20 }}', 'strings or numbers')
    bad('{a: { width: null }}', 'strings or numbers')
    bad('{a: { width: false }}', 'strings or numbers')
    bad('{a: { width: foo(bar) }}', 'strings or numbers')
  })
})
