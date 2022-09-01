/* eslint-disable no-use-before-define */
const { unitlessCssAttributes } = require('./attributes')
const { getPlatform, getTarget } = require('./state')

function isPlainObjectProperty(t, node, allowStringLiterals) {
  const isAllowedKey =
    t.isIdentifier(node.key) || (allowStringLiterals && t.isStringLiteral(node.key))
  return (
    t.isObjectProperty(node) && isAllowedKey && !node.shorthand && !node.computed && !node.method
  )
}

function isPlainTemplateLiteral(t, node) {
  return t.isTemplateLiteral(node) && !node.expressions.length && node.quasis.length === 1
}

function isNumberLiteral(t, node) {
  return (
    t.isNumericLiteral(node) ||
    (t.isUnaryExpression(node) &&
      node.operator === '-' &&
      node.prefix &&
      t.isNumericLiteral(node.argument))
  )
}

// ZACS_STYLESHEET_LITERAL(xxx) - magic syntax that passes validation
// for use by babel plugins that transform dynamic expressions into static literals
function isZacsStyleSheetLiteral(t, node) {
  return (
    t.isCallExpression(node) && t.isIdentifier(node.callee, { name: 'ZACS_STYLESHEET_LITERAL' })
  )
}

function validateStyleset(t, styleset, nestedIn) {
  if (!t.isObjectExpression(styleset.node)) {
    throw styleset.buildCodeFrameError(
      "ZACS StyleSheets must be simple object literals, like so: `text: { backgroundColor: 'red', height: 100 }`. Other syntaxes, like `foo ? {xxx} : {yyy}` or `...styles` are not allowed.",
    )
  }

  const properties = styleset.get('properties')
  properties.forEach(property => {
    // FIXME: We want to allow `...{literal-object}` syntax as a natural way to do mixins, but
    // most setups use a Babel plugin that will transpile object spread syntax into a function call
    // before ZACS stylesheets be processed. We can't do all processing earlier because that will
    // break constant-replacement and other plugins that turn dynamic syntax into compile-time constants
    // I think the way to fix it is to preprocess at the beginning, traverse object literal tree and
    // replace `...`s, but that might still turn out to be buggy...

    // if (t.isSpreadElement(property.node)) {
    //   const spreadArg = property.get('argument')
    //   if (!t.isObjectExpression(spreadArg.node)) {
    //     throw spreadArg.buildCodeFrameError("Spread element in a ZACS StyleSheet must be a simple object literal, like so: `{ height: 100, ...{ width: 200 } }`. Other syntaxes, like `...styles` are not allowed.")
    //   }
    //   validateStyleset(t, spreadArg, nestedIn)
    //   return
    // }

    if (!isPlainObjectProperty(t, property.node, true)) {
      throw property.buildCodeFrameError(
        "ZACS StyleSheets style attributes must be simple strings, like so: `{ backgroundColor: 'red', height: 100 }`. Other syntaxes, like `[propName]:` are not allowed.",
      )
    }
    const valuePath = property.get('value')
    const value = valuePath.node

    if (t.isStringLiteral(property.node.key)) {
      if (!t.isObjectExpression(value)) {
        throw styleset.buildCodeFrameError(
          'ZACS StyleSheets style attributes must be simple strings, like so: `{ backgroundColor: \'red\', height: 100 }`. Quoted keys are only allowed for web inner styles, e.g. `{ "& > span": { opacity: 0.5 } }`',
        )
      }
      validateStyleset(t, valuePath, 'web')
      return
    }

    const key = property.node.key.name

    if (key === 'css') {
      if (!(t.isStringLiteral(value) || isPlainTemplateLiteral(t, value))) {
        throw valuePath.buildCodeFrameError(
          "ZACS StyleSheet's magic css: property expects a simple literal string as its value. Object expressions, references, expressions in a template literal are not allowed.",
        )
      }
    } else if (key === '_mixin') {
      validateStyleset(t, valuePath, nestedIn)
    } else if (key === 'web' || key === 'native' || key === 'ios' || key === 'android') {
      if (nestedIn) {
        throw property.buildCodeFrameError(
          'ZACS StyleSheets cannot have platform-specific blocks nested within a platform-specific block',
        )
      }

      validateStyleset(t, valuePath, key)
    } else {
      const nestedInNative = nestedIn === 'native' || nestedIn === 'ios' || nestedIn === 'android'
      if (
        !(
          t.isStringLiteral(value) ||
          isNumberLiteral(t, value) ||
          isZacsStyleSheetLiteral(t, value)
        ) &&
        !nestedInNative
      ) {
        throw valuePath.buildCodeFrameError(
          "ZACS StyleSheet's style values must be simple literal strings or numbers, e.g.: `backgroundColor: 'red'`, or `height: 100.`. Compound expressions, references, and other syntaxes are not allowed",
        )
      }
    }
  })
}

function validateStyleSheet(t, path) {
  const args = path.get('init.arguments')
  const stylesheet = args[0]
  if (!(args.length === 1 && t.isObjectExpression(stylesheet.node))) {
    throw path.buildCodeFrameError('ZACS StyleSheet accepts a single Object argument')
  }

  stylesheet.get('properties').forEach(styleset => {
    if (!isPlainObjectProperty(t, styleset.node)) {
      throw styleset.buildCodeFrameError(
        'ZACS StyleSheet stylesets must be defined as `name: {}`. Other syntaxes, like `[name]:`, `"name": `, `...styles` are not allowed',
      )
    }
    const stylesetName = styleset.node.key.name
    if (stylesetName === 'css') {
      const cssValue = styleset.get('value')
      if (!(t.isStringLiteral(cssValue.node) || isPlainTemplateLiteral(t, cssValue.node))) {
        throw cssValue.buildCodeFrameError(
          "ZACS StyleSheet's magic css: styleset expects a simple literal string as its value. Object expressions, references, expressions in a template literal are not allowed.",
        )
      }
    } else {
      validateStyleset(t, styleset.get('value'), null)
    }
  })
}

const strval = stringLiteralOrPlainTemplateLiteral =>
  stringLiteralOrPlainTemplateLiteral.value ||
  stringLiteralOrPlainTemplateLiteral.quasis[0].value.cooked

const capitalRegex = /([A-Z])/g
const cssCaseReplacer = (match, letter) => `-${letter.toLowerCase()}`
function encodeCSSProperty(property) {
  return property.replace(capitalRegex, cssCaseReplacer)
}

function normalizeNumber(node) {
  // assume number literal or unaryExpr(-, num)
  if (node.argument) {
    return -node.argument.value
  }

  return node.value
}

function encodeCSSValue(property, value) {
  const val = normalizeNumber(value)
  if (typeof val === 'number' && !unitlessCssAttributes.has(property)) {
    return `${val}px`
  }
  return val
}

function encodeCSSStyle(property, spaces = '  ') {
  if (property.type === 'SpreadElement') {
    return encodeCSSStyles(property.argument, spaces)
  }

  const { value } = property

  if (property.key.value) {
    return `${spaces}${property.key.value} {\n${encodeCSSStyles(value, `${spaces}  `)}\n${spaces}}`
  }

  const key = property.key.name
  if (key === 'native' || key === 'ios' || key === 'android') {
    return null
  } else if (key === 'css') {
    return `${spaces}${strval(value)}`
  } else if (key === 'web' || key === '_mixin') {
    return encodeCSSStyles(value)
  }

  return `${spaces}${encodeCSSProperty(key)}: ${encodeCSSValue(key, value)};`
}

function encodeCSSStyles(styleset, spaces) {
  return styleset.properties
    .map(style => encodeCSSStyle(style, spaces))
    .filter(rule => rule !== null)
    .join('\n')
}

function encodeCSSStyleset(styleset) {
  const { name } = styleset.key

  if (name === 'css') {
    return strval(styleset.value)
  }

  return `.${name} {\n${encodeCSSStyles(styleset.value)}\n}`
}
function encodeCSSStyleSheet(stylesheet) {
  const stylesets = stylesheet.properties.map(encodeCSSStyleset).join('\n\n')
  return `${stylesets}\n`
}

function resolveRNStylesheet(t, platform, target, stylesheet) {
  stylesheet.properties = stylesheet.properties
    .filter(styleset => styleset.key.name !== 'css')
    .map(styleset => {
      const resolvedProperties = []
      const pushProp = property => {
        if (isZacsStyleSheetLiteral(t, property.value)) {
          // strip ZACS_STYLESHEET_LITERAL(x)
          const [wrappedValue] = property.value.arguments
          property.value = wrappedValue
        }
        resolvedProperties.push(property)
      }
      const pushFromInner = objectExpr => {
        objectExpr.properties.forEach(property => {
          if (
            property.type === 'ObjectProperty' &&
            property.key.name === '_mixin' &&
            property.value.type === 'ObjectExpression'
          ) {
            pushFromInner(property.value)
          } else {
            pushProp(property)
          }
        })
      }
      styleset.value.properties.forEach(property => {
        if (property.type === 'SpreadElement') {
          pushFromInner(property.argument)
          return
        }

        const key = property.key.name
        if (key === 'web' || key === 'css') {
          // do nothing
        } else if (property.key.value) {
          // css inner selector - do nothing
        } else if (key === 'native' || key === '_mixin') {
          pushFromInner(property.value)
        } else if (key === 'ios' || key === 'android') {
          if (target === key) {
            pushFromInner(property.value)
          }
        } else {
          pushProp(property)
        }
      })
      styleset.value.properties = resolvedProperties
      return styleset
    })

  return stylesheet
}

function transformStyleSheet(t, state, path) {
  const { node } = path
  const { init } = node
  const { arguments: args } = init
  const platform = getPlatform(state)

  validateStyleSheet(t, path)

  const stylesheet = args[0]

  if (platform === 'web') {
    const css = encodeCSSStyleSheet(stylesheet)
    const preparedCss = `\n${css}ZACS_MAGIC_CSS_STYLESHEET_MARKER_END`
    const formattedCss = t.stringLiteral(preparedCss)
    // NOTE: We can't use a template literal, because most people use a Babel transform for it, and it
    // doesn't spit out clean output. So we spit out an ugly string literal, but keep it multi-line
    // so that it's easier to view source code in case webpack fails to extract it.
    // TODO: Escaped characters are probably broken here, please investigate
    formattedCss.extra = {
      rawValue: preparedCss,
      raw: `"${preparedCss.split('\n').join(' \\n\\\n')}"`,
    }

    const magicCssExpression = t.expressionStatement(
      t.callExpression(t.identifier('ZACS_MAGIC_CSS_STYLESHEET_MARKER_START'), [formattedCss]),
    )
    t.addComment(
      path.parent,
      'leading',
      '\nZACS-generated CSS stylesheet begins below.\nPRO TIP: If you get a ReferenceError on the line below, it means that your Webpack ZACS support is not configured properly.\nIf you only see this comment and the one below in generated code, this is normal, nothing to worry about!\n',
    )
    path.get('init').replaceWith(magicCssExpression)
    t.addComment(path.parent, 'trailing', ' ZACS-generated CSS stylesheet ends above ')
  } else if (platform === 'native') {
    state.set(`uses_rn`, true)
    state.set(`uses_rn_stylesheet`, true)

    const target = getTarget(state)

    const resolvedRules = resolveRNStylesheet(t, platform, target, stylesheet)
    const rnStylesheet = t.callExpression(
      t.memberExpression(t.identifier('ZACS_RN_StyleSheet'), t.identifier('create')),
      [resolvedRules],
    )
    path.get('init').replaceWith(rnStylesheet)
  } else {
    throw new Error('unknown platform')
  }
}

module.exports = { transformStyleSheet }
