const { types: t } = require('@babel/core')
const { getPlatform } = require('./state')
const { transformStylesheetCSS } = require('./stylesheet-css')
const { transformStylesheetRN } = require('./stylesheet-rn')
const { isValueAllowed } = require('./stylesheet-utils')

function isPlainObjectProperty(node, allowStringLiterals) {
  const isAllowedKey =
    t.isIdentifier(node.key) || (allowStringLiterals && t.isStringLiteral(node.key))
  return (
    t.isObjectProperty(node) && isAllowedKey && !node.shorthand && !node.computed && !node.method
  )
}

function isPlainTemplateLiteral(node) {
  return t.isTemplateLiteral(node) && !node.expressions.length && node.quasis.length === 1
}

function validateStyleset(styleset, nestedIn) {
  if (!t.isObjectExpression(styleset.node)) {
    throw styleset.buildCodeFrameError(
      "ZACS Stylesheets must be simple object literals, like so: `text: { backgroundColor: 'red', height: 100 }`. Other syntaxes, like `foo ? {xxx} : {yyy}` or `...styles` are not allowed.",
    )
  }

  const properties = styleset.get('properties')
  properties.forEach((property) => {
    // FIXME: We want to allow `...{literal-object}` syntax as a natural way to do mixins, but
    // most setups use a Babel plugin that will transpile object spread syntax into a function call
    // before ZACS stylesheets be processed. We can't do all processing earlier because that will
    // break constant-replacement and other plugins that turn dynamic syntax into compile-time constants
    // I think the way to fix it is to preprocess at the beginning, traverse object literal tree and
    // replace `...`s, but that might still turn out to be buggy...

    // if (t.isSpreadElement(property.node)) {
    //   const spreadArg = property.get('argument')
    //   if (!t.isObjectExpression(spreadArg.node)) {
    //     throw spreadArg.buildCodeFrameError("Spread element in a ZACS Stylesheet must be a simple object literal, like so: `{ height: 100, ...{ width: 200 } }`. Other syntaxes, like `...styles` are not allowed.")
    //   }
    //   validateStyleset( spreadArg, nestedIn)
    //   return
    // }

    if (!isPlainObjectProperty(property.node, true)) {
      throw property.buildCodeFrameError(
        "ZACS Stylesheets style attributes must be simple strings, like so: `{ backgroundColor: 'red', height: 100 }`. Other syntaxes, like `[propName]:` are not allowed.",
      )
    }
    const valuePath = property.get('value')
    const value = valuePath.node

    if (t.isStringLiteral(property.node.key)) {
      if (!t.isObjectExpression(value)) {
        throw styleset.buildCodeFrameError(
          'ZACS Stylesheets style attributes must be simple strings, like so: `{ backgroundColor: \'red\', height: 100 }`. Quoted keys are only allowed for web inner styles, e.g. `{ "& > span": { opacity: 0.5 } }`',
        )
      }
      validateStyleset(valuePath, 'web')
      return
    }

    const key = property.node.key.name

    if (key === 'css') {
      if (!(t.isStringLiteral(value) || isPlainTemplateLiteral(value))) {
        throw valuePath.buildCodeFrameError(
          "ZACS Stylesheet's magic css: property expects a simple literal string as its value. Object expressions, references, expressions in a template literal are not allowed.",
        )
      }
    } else if (key === '_mixin') {
      validateStyleset(valuePath, nestedIn)
    } else if (key === 'web' || key === 'native' || key === 'ios' || key === 'android') {
      if (nestedIn) {
        throw property.buildCodeFrameError(
          'ZACS Stylesheets cannot have platform-specific blocks nested within a platform-specific block',
        )
      }

      validateStyleset(valuePath, key)
    } else {
      const nestedInNative = nestedIn === 'native' || nestedIn === 'ios' || nestedIn === 'android'
      if (!isValueAllowed(key, value) && !nestedInNative) {
        throw valuePath.buildCodeFrameError(
          "ZACS Stylesheet's style values must be simple literal strings or numbers, e.g.: `backgroundColor: 'red'`, or `height: 100.`. Also allowed are margin/padding/inset shorthands (`margin: [5, 10, '20%']`) and border shorthand (`border: [1, 'solid', 'red']`). Compound expressions, references, and other syntaxes are not allowed.",
        )
      }
    }
  })
}

function validateStylesheet(path) {
  const args = path.get('init.arguments')
  const stylesheet = args[0]
  if (!(args.length === 1 && t.isObjectExpression(stylesheet.node))) {
    throw path.buildCodeFrameError('ZACS Stylesheet accepts a single Object argument')
  }

  stylesheet.get('properties').forEach((styleset) => {
    if (!isPlainObjectProperty(styleset.node)) {
      throw styleset.buildCodeFrameError(
        'ZACS Stylesheet stylesets must be defined as `name: {}`. Other syntaxes, like `[name]:`, `"name": `, `...styles` are not allowed',
      )
    }
    const stylesetName = styleset.node.key.name
    if (stylesetName === 'css') {
      const cssValue = styleset.get('value')
      if (!(t.isStringLiteral(cssValue.node) || isPlainTemplateLiteral(cssValue.node))) {
        throw cssValue.buildCodeFrameError(
          "ZACS Stylesheet's magic css: styleset expects a simple literal string as its value. Object expressions, references, expressions in a template literal are not allowed.",
        )
      }
    } else {
      validateStyleset(styleset.get('value'), null)
    }
  })
}

function transformStylesheet(state, path) {
  validateStylesheet(path)

  const stylesheet = path.node.init.arguments[0]
  const platform = getPlatform(state)

  if (platform === 'web') {
    transformStylesheetCSS(path, stylesheet)
  } else if (platform === 'native') {
    transformStylesheetRN(path, stylesheet, state)
  } else {
    throw new Error('unknown platform')
  }
}

module.exports = { transformStylesheet }
