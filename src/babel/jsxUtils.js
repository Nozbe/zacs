const { types: t } = require('@babel/core')

// Note: Uppercase JSXIdentifiers won't be converted to React.createElement('Foo'), but
// React.createElement(Foo).
function jsxIsBuiltinSafe(name) {
  return !!/^[a-z]/.test(name)
}

function jsxName(name, isBuiltin) {
  if (isBuiltin && !jsxIsBuiltinSafe(name)) {
    // HACK: Return a StringLiteral instead of JSXIdentifier to force
    // createElement("Foo"), not createElement(Foo).
    // This is wrong and will break if this path changes:
    //   https://github.com/babel/babel/blob/a547f8724a5c6b4395b8a8f597e3edd44de74bf3/packages/babel-plugin-transform-react-jsx/src/create-plugin.ts#L414
    // Alternative is to emit `const Foo = 'Foo'` and use that,
    // but that's unnecessary code emitted, and this is ZACS!
    return t.stringLiteral(name)
  }

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

function jsxAttr(name, value) {
  return t.jSXAttribute(t.jSXIdentifier(name), t.jSXExpressionContainer(value))
}

function jsxRenameElement(node, name, isBuiltin) {
  const { openingElement, closingElement } = node
  const jsxId = jsxName(name, isBuiltin)

  openingElement.name = jsxId
  if (closingElement) {
    closingElement.name = jsxId
  }
}

function jsxGetAttrValue(attr) {
  if (attr.value === null) {
    return t.booleanLiteral(true)
  } else if (t.isJSXExpressionContainer(attr.value)) {
    return attr.value.expression
  } else if (t.isStringLiteral(attr.value)) {
    return attr.value
  }
  throw new Error('Unknown JSX Attribute value type')
}

function jsxInferAttrTruthiness(attr) {
  const value = jsxGetAttrValue(attr)

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

function jsxHasAttrNamed(name, attributes) {
  return attributes.find((attribute) => t.isJSXAttribute(attribute) && attribute.name.name === name)
}

function jsxFindNamespacedAttr(attributes, attrName) {
  return attributes.find(
    ({ name }) =>
      t.isJSXNamespacedName(name) && name.namespace.name === 'zacs' && name.name.name === attrName,
  )
}

module.exports = {
  jsxName,
  jsxAttr,
  jsxRenameElement,
  jsxGetAttrValue,
  jsxInferAttrTruthiness,
  jsxHasAttrNamed,
  jsxFindNamespacedAttr,
  jsxIsBuiltinSafe,
}
