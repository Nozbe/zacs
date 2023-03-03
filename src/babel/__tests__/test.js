const babel = require('@babel/core')
const path = require('path')
const fs = require('fs')
const plugin = require('../index')
require('jest-specific-snapshot')

function testBabelPlugin(pluginBabel) {
  const { types: t } = pluginBabel

  return {
    name: 'test-plugin',
    visitor: {
      Identifier(p) {
        if (p.node.name === 'REPLACE_INTO_NUMBER') {
          p.replaceWith(t.numericLiteral(2137))
        }
      },
    },
  }
}

function transform(input, platform, extra = {}) {
  const { code } = babel.transform(input, {
    configFile: false,
    plugins: ['@babel/plugin-syntax-jsx', [plugin, { platform, ...extra }], testBabelPlugin],
  })
  return code
}

function example(name) {
  return fs.readFileSync(path.resolve(__dirname, 'examples', `${name}.js`)).toString()
}

function snapshot(name) {
  return `./__snapshots__/${name}`
}

describe('zacs', () => {
  const examples = [
    'declaration_unconditionalStyle',
    'webSafeAttributes',
    'declaration_null',
    'declaration_conditionalStyleSpec',
    'declaration_literalStyleSpec',
    'zacs:style',
    'declaration_manyStyleSources',
    'zacs:inherit',
    'zacs.styled(builtin)',
    'zacs.styled(Component)',
    'zacs.styled(Namespaced.Component)',
    'zacs.styled(platforms)',
    'zacs.createX',
  ]
  examples.forEach(exampleName => {
    it(`example: ${exampleName}, web`, () => {
      expect(transform(example(exampleName), 'web')).toMatchSpecificSnapshot(
        snapshot(`${exampleName}_web`),
      )
    })
    it(`example: ${exampleName}, native`, () => {
      expect(transform(example(exampleName), 'native')).toMatchSpecificSnapshot(
        snapshot(`${exampleName}_native`),
      )
    })
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
    expect(transform(example('production'), 'web', { production: true })).toMatchSpecificSnapshot(
      snapshot('production'),
    )
  })
  it(`preserves declarations if requested`, () => {
    expect(
      transform(example('production'), 'web', { production: true, keepDeclarations: true }),
    ).toMatchSpecificSnapshot('production_keepDeclarations')
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
      `import * as ZACS from '@nozbe/zacs'`,
      `import ZACS from 'zacs'`,
    ]
    badForms.forEach(js => {
      // console.log(js)
      expect(() => transform(js, 'web')).toThrow('ZACS import must say exactly')
    })
  })
})

describe('zacs stylesheets', () => {
  const webNativeExamples = [
    'stylesheet_babelReplacement',
    'stylesheet_mixins',
    'stylesheet_css',
    'stylesheet_shorthand_box',
    'stylesheet_shorthand_border',
    'stylesheet_shorthand_scoped',
  ]
  const webIosAndroidExamples = []
  webNativeExamples.forEach(exampleName => {
    const platforms = ['web', 'native']
    platforms.forEach(platform => {
      it(`example: ${exampleName}, ${platform}`, () => {
        expect(transform(example(exampleName), platform)).toMatchSpecificSnapshot(
          snapshot(`${exampleName}_${platform}`),
        )
      })
    })
  })
  webIosAndroidExamples.forEach(exampleName => {
    const platforms = ['web', 'ios', 'android']
    platforms.forEach(platform => {
      it(`example: ${exampleName}, ${platform}`, () => {
        expect(
          transform(example(exampleName), platform === 'web' ? 'web' : 'native', {
            target: platform,
          }),
        ).toMatchSpecificSnapshot(snapshot(`${exampleName}_${platform}`))
      })
    })
  })
  it(`transforms experimental stylesheets (web)`, () => {
    expect(transform(example('stylesheet'), 'web')).toMatchSpecificSnapshot(
      snapshot('stylesheets_web'),
    )
  })
  it(`transforms experimental stylesheets (native)`, () => {
    expect(transform(example('stylesheet'), 'native')).toMatchSpecificSnapshot(
      snapshot('stylesheets_native'),
    )
  })
  it(`transforms experimental stylesheets (native, ios)`, () => {
    expect(transform(example('stylesheet'), 'native', { target: 'ios' })).toMatchSpecificSnapshot(
      snapshot('stylesheets_ios'),
    )
  })
  it(`transforms experimental stylesheets (native, android)`, () => {
    expect(
      transform(example('stylesheet'), 'native', { target: 'android' }),
    ).toMatchSpecificSnapshot(snapshot('stylesheets_android'))
  })
  it(`transforms ZACS_STYLESHEET_LITERAL (android)`, () => {
    expect(
      transform(example('ZACS_STYLESHEET_LITERAL'), 'native', { target: 'android' }),
    ).toMatchSpecificSnapshot(snapshot('ZACS_STYLESHEET_LITERAL_android'))
  })
  it(`transforms ZACS_STYLESHEET_LITERAL (ios)`, () => {
    expect(
      transform(example('ZACS_STYLESHEET_LITERAL'), 'native', { target: 'ios' }),
    ).toMatchSpecificSnapshot(snapshot('ZACS_STYLESHEET_LITERAL_ios'))
  })
  it(`throw an error on illegal stylesheets`, () => {
    const bad = (syntax, error) =>
      expect(() => transform(`const _ = zacs.stylesheet(${syntax})`, 'web')).toThrow(error)

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

    bad('{a: {native:{ios:{}}}}', 'nested')
    bad('{a: {web:{web:{}}}}', 'nested')
  })
})
