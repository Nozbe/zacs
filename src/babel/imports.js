const { types: t, template } = require('@babel/core')
const { getPlatform, isProduction } = require('./state')

function validateZacsImport(path) {
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

// TODO: This is ugly, the need to import should be cleanly abstracted
// instead of comparing magic strings
function setUsesRN(state, elementName) {
  if (elementName === 'ZACS_RN_View') {
    state.set('uses_rn_view', true)
  } else if (elementName === 'ZACS_RN_Text') {
    state.set('uses_rn_text', true)
  }
}

function handleImportDeclaration(path, state) {
  const { node } = path

  if (
    !node.source ||
    // Make it work even if someone makes a fork of zacs
    !(node.source.value === 'zacs' || node.source.value.endsWith('/zacs'))
  ) {
    return
  }

  validateZacsImport(path)

  if (isProduction(state)) {
    path.remove()
  }
}

function injectNativeImportsIfNeeded(path, state) {
  const platform = getPlatform(state)

  if (platform !== 'native') {
    return
  }

  if (state.get('uses_rn')) {
    const myImport = template(`const zacsReactNative = require('react-native')`)
    const [zacsRN] = path.get('body')[0].insertBefore(myImport())

    if (state.get('uses_rn_stylesheet')) {
      const makeZacsElement = template(`const ZACS_RN_StyleSheet = zacsReactNative.StyleSheet`)
      zacsRN.insertAfter(makeZacsElement())
    }
  }

  // After minification, these requires are going to be a bit smaller and denser than RN require

  if (state.get('uses_rn_view')) {
    const makeZacsElement = template(`const ZACS_RN_View = require('@nozbe/zacs/src/ZACS_RN_View')`)
    path.get('body')[0].insertBefore(makeZacsElement())
  }

  if (state.get('uses_rn_text')) {
    const makeZacsElement = template(`const ZACS_RN_Text = require('@nozbe/zacs/src/ZACS_RN_Text')`)
    path.get('body')[0].insertBefore(makeZacsElement())
  }
}

module.exports = { setUsesRN, handleImportDeclaration, injectNativeImportsIfNeeded }
