function jsxName(t, name) {
  if (name.includes('.')) {
    const segments = name.split('.')
    if (segments.length !== 2) {
      throw new Error(`Invalid JSX name ${name}`)
    }
    const [obj, prop] = segments
    return t.jSXMemberExpression(t.jSXIdentifier(obj), t.jSXIdentifier(prop))
  }
  return t.jSXIdentifier(name)
}

function jsxAttr(t, name, value) {
  return t.jSXAttribute(t.jSXIdentifier(name), t.jSXExpressionContainer(value))
}

function jsxRenameElement(t, node, name) {
  const { openingElement, closingElement } = node
  const jsxId = jsxName(t, name)

  openingElement.name = jsxId
  if (closingElement) {
    closingElement.name = jsxId
  }
}

function jsxGetAttrValue(t, attr) {
  if (attr.value === null) {
    return t.booleanLiteral(true)
  } else if (t.isJSXExpressionContainer(attr.value)) {
    return attr.value.expression
  } else if (t.isStringLiteral(attr.value)) {
    return attr.value
  }
  throw new Error('Unknown JSX Attribute value type')
}

function jsxInferAttrTruthiness(t, attr) {
  const value = jsxGetAttrValue(t, attr)

  if (
    t.isBooleanLiteral(value, { value: true }) ||
    (t.isStringLiteral(value) && value.value.length) ||
    (t.isNumericLiteral(value) && value.value)
  ) {
    return true
  }

  if (
    t.isBooleanLiteral(value, { value: false }) ||
    t.isNullLiteral(value) ||
    (t.isStringLiteral(value) && value.value === '') ||
    (t.isNumericLiteral(value) && value.value === 0) ||
    t.isIdentifier(value, { name: 'undefined' }) ||
    t.isIdentifier(value, { name: 'NaN' })
  ) {
    return false
  }

  return value
}

function jsxHasAttrNamed(t, name, attributes) {
  return attributes.find(attribute => t.isJSXAttribute(attribute) && attribute.name.name === name)
}

module.exports = {
  jsxName,
  jsxAttr,
  jsxRenameElement,
  jsxGetAttrValue,
  jsxInferAttrTruthiness,
  jsxHasAttrNamed,
}
