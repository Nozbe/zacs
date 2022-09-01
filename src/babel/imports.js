const { getPlatform } = require('./state')

function validateZacsImport(t, path) {
  const { node } = path
  if (
    !(
      node.specifiers.length === 1 &&
      node.specifiers[0].local.name === 'zacs' &&
      // import zacs from 'zacs'
      (t.isImportDefaultSpecifier(node.specifiers[0]) ||
        // import * as zacs from 'zacs'
        t.isImportNamespaceSpecifier(node.specifiers[0]))
    )
  ) {
    throw path.buildCodeFrameError(
      "ZACS import must say exactly `import zacs from '@nozbe/zacs'` or `import * as zacs from '@nozbe/zacs'`. Other forms such as `import { view, text }`, `require` are not allowed.",
    )
  }
}

function handleImportDeclaration(t, path, state) {
  const { node } = path

  if (
    !node.source ||
    // Make it work even if someone makes a fork of zacs
    !(node.source.value === 'zacs' || node.source.value.endsWith('/zacs'))
  ) {
    return
  }

  validateZacsImport(t, path)

  if (!state.opts.keepDeclarations) {
    path.remove()
  }
}

function injectNativeImportsIfNeeded(babel, path, state) {
  const platform = getPlatform(state)

  if (platform === 'native' && state.get('uses_rn')) {
    const myImport = babel.template(`const zacsReactNative = require('react-native')`)
    const [zacsRN] = path.get('body')[0].insertBefore(myImport())

    if (state.get('uses_rn_view')) {
      const makeZacsElement = babel.template(`const ZACS_RN_View = zacsReactNative.View`)
      zacsRN.insertAfter(makeZacsElement())
    }

    if (state.get('uses_rn_text')) {
      const makeZacsElement = babel.template(`const ZACS_RN_Text = zacsReactNative.Text`)
      zacsRN.insertAfter(makeZacsElement())
    }

    if (state.get('uses_rn_stylesheet')) {
      const makeZacsElement = babel.template(
        `const ZACS_RN_StyleSheet = zacsReactNative.StyleSheet`,
      )
      zacsRN.insertAfter(makeZacsElement())
    }
  }
}

module.exports = { handleImportDeclaration, injectNativeImportsIfNeeded }