/* eslint-disable no-use-before-define */
const { types: t } = require('@babel/core')
const { unitlessCssAttributes } = require('./attributes')

const comment = (text) => `/*${text} */`

const leadingComments = (node, spaces = '') => {
  if (node && node.leadingComments) {
    return `${node.leadingComments.map((c) => spaces + comment(c.value)).join('\n')}\n`
  }
  return ''
}
const trailingComments = (node, spaces = '') => {
  if (node && node.trailingComments) {
    return `\n${node.trailingComments.map((c) => spaces + comment(c.value)).join('\n')}`
  }
  return ''
}

const strval = (stringLiteralOrPlainTemplateLiteral) =>
  stringLiteralOrPlainTemplateLiteral.value ||
  stringLiteralOrPlainTemplateLiteral.quasis[0].value.cooked

const capitalRegex = /([A-Z])/g
const cssCaseReplacer = (match, letter) => `-${letter.toLowerCase()}`
function encodeCSSProperty(property) {
  return property.replace(capitalRegex, cssCaseReplacer)
}

function normalizeVal(node) {
  // assume number literal or unaryExpr(-, num)
  if (node.argument) {
    return -node.argument.value
  } else if (typeof node === 'string') {
    return node
  }

  return node.value
}

function encodeCSSValue(property, value) {
  const val = normalizeVal(value)
  if (typeof val === 'number' && !unitlessCssAttributes.has(property)) {
    return `${val}px`
  }
  return val
}

function encodeCSSLine(spaces, key, value) {
  return `${spaces}${encodeCSSProperty(key)}: ${encodeCSSValue(key, value)};`
}

function encodeCSSLines(spaces, object) {
  return Object.entries(object)
    .map(([key, value]) => encodeCSSLine(spaces, key, value))
    .join('\n')
}

function resolveShorthands(key, node) {
  if (node.type !== 'ArrayExpression') {
    return null
  }
  return {
    [key]: node.elements.map((el) => encodeCSSValue('', el)).join(' '),
  }
}

function encodeCSSStyle(property, spaces) {
  if (property.type === 'SpreadElement') {
    return encodeCSSStyles(property.argument, spaces)
  }

  const { value } = property

  if (property.key.value) {
    return `${spaces}${property.key.value} {\n${encodeCSSStyles(value, `${spaces}  `)}\n${spaces}}`
  }

  const key = property.key.name

  if (key === 'native' || key === 'ios' || key === 'android') {
    return ''
  } else if (key === 'css') {
    return `${spaces}${strval(value)}`
  } else if (key === 'web' || key === '_mixin') {
    return encodeCSSStyles(value)
  }

  const shorthandLines = resolveShorthands(key, value)
  if (shorthandLines) {
    return encodeCSSLines(spaces, shorthandLines)
  }

  return encodeCSSLine(spaces, key, value)
}

function encodeCSSStyles(styleset, spaces = '  ') {
  return styleset.properties
    .map(
      (style) =>
        leadingComments(style, spaces) +
        encodeCSSStyle(style, spaces) +
        trailingComments(style, spaces),
    )
    .filter(Boolean)
    .join('\n')
}

function encodeCSSSelector(key) {
  if (key.name) {
    return `.${key.name}`
  } else if (key.value) {
    return key.value
  }

  throw new Error(`Unknown styleset type`)
}

function encodeCSSStyleset(styleset) {
  if (styleset.key.name === 'css') {
    return leadingComments(styleset) + strval(styleset.value) + trailingComments(styleset)
  }

  return `${leadingComments(styleset)}${encodeCSSSelector(styleset.key)} {\n${encodeCSSStyles(
    styleset.value,
  )}\n}${trailingComments(styleset)}`
}

function encodeCSSStylesheet(stylesheet) {
  const stylesets = stylesheet.properties.map(encodeCSSStyleset).join('\n\n')
  return `${stylesets}\n`
}

function transformStylesheetCSS(path, stylesheet) {
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
