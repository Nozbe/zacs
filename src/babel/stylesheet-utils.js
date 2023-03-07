const { types: t } = require('@babel/core')

function isNumberLiteral(node) {
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
function isZacsStylesheetLiteral(node) {
  return (
    t.isCallExpression(node) && t.isIdentifier(node.callee, { name: 'ZACS_STYLESHEET_LITERAL' })
  )
}

function isSimpleValue(node) {
  return t.isStringLiteral(node) || isNumberLiteral(node) || isZacsStylesheetLiteral(node)
}

function isAllowedShorthand(key, node) {
  if (!t.isArrayExpression(node)) {
    return false
  }
  const { elements } = node
  if (!elements.every((el) => isSimpleValue(el))) {
    return false
  }

  const { length } = elements
  switch (key) {
    case 'margin':
    case 'padding':
    case 'inset':
      return length >= 1 && length <= 4
    case 'border':
    case 'borderTop':
    case 'borderRight':
    case 'borderBottom':
    case 'borderLeft':
      return length === 3
    default:
      return false
  }
}

function isValueAllowed(key, node) {
  return isSimpleValue(node) || isAllowedShorthand(key, node)
}

function resolveInsetsShorthand(node) {
  if (node.type === 'ArrayExpression') {
    const [top, right, bottom, left] = node.elements
    return [top, right || top, bottom || top, left || right || top]
  }

  return [node, node, node, node]
}

module.exports = { isValueAllowed, isZacsStylesheetLiteral, resolveInsetsShorthand }
