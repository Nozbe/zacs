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
function isZacsStylesheetLiteral(t, node) {
  return (
    t.isCallExpression(node) && t.isIdentifier(node.callee, { name: 'ZACS_STYLESHEET_LITERAL' })
  )
}

function isSimpleValue(t, node) {
  return t.isStringLiteral(node) || isNumberLiteral(t, node) || isZacsStylesheetLiteral(t, node)
}

function isAllowedShorthand(t, key, node) {
  if (!t.isArrayExpression(node)) {
    return false
  }
  const { elements } = node
  if (!elements.every(el => isSimpleValue(t, el))) {
    return false
  }

  const { length } = elements
  switch (key) {
    case 'margin':
    case 'padding':
    case 'inset':
      return length >= 1 && length <= 4
    case 'border':
      return length === 3
    default:
      return false
  }
}

function isValueAllowed(t, key, node) {
  return isSimpleValue(t, node) || isAllowedShorthand(t, key, node)
}

module.exports = { isValueAllowed, isZacsStylesheetLiteral }
