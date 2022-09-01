/* eslint-disable no-use-before-define */
const { unitlessCssAttributes } = require('./attributes')

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

function encodeCSSStylesheet(stylesheet) {
  const stylesets = stylesheet.properties.map(encodeCSSStyleset).join('\n\n')
  return `${stylesets}\n`
}

function transformStylesheetCSS(t, path, stylesheet) {
  const css = encodeCSSStylesheet(stylesheet)
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
}

module.exports = { transformStylesheetCSS }
