const { htmlElements } = require('./attributes')
const { getPlatform } = require('./state')
const { jsxName, jsxAttr } = require('./jsxUtils')
const { getElementName, isAttributeWebSafe, styleAttributes } = require('./elements')
const { setUsesRN } = require('./imports')

function propsChildren(t) {
  return [
    t.jSXExpressionContainer(t.memberExpression(t.identifier('props'), t.identifier('children'))),
  ]
}

function forwardRef(t, component) {
  return t.callExpression(t.memberExpression(t.identifier('React'), t.identifier('forwardRef')), [
    component,
  ])
}

const createMethodToZacsMethod = {
  createView: 'view',
  createText: 'text',
  createStyled: 'styled',
}

function arrayExprToStringArray(t, expr) {
  if (!expr || t.isNullLiteral(expr)) {
    return []
  }

  return expr.elements.map((element) => {
    // TODO: Validate passed props earlier, don't just crash babel
    t.assertStringLiteral(element)
    if (element.value === 'style' || element.value === 'className') {
      throw new Error(`Don't add style/className to passed props, add 'zacs:inherit' instead`)
    }
    return element.value
  })
}

function createZacsComponent(t, state, path) {
  const { node } = path
  const { init } = node
  const platform = getPlatform(state)

  const zacsMethod = createMethodToZacsMethod[init.callee.property.name]
  const [elementName, isBuiltin] = getElementName(
    t,
    platform,
    path, // should be path to declaration
    undefined, // TODO: this should be the name of the component
    zacsMethod === 'styled' ? init.arguments[0] : zacsMethod,
  )
  const [uncondStyles, condStyles, literalStyleSpec, passedPropsExpr] =
    zacsMethod === 'styled' ? init.arguments.slice(1) : init.arguments

  if (platform === 'native') {
    setUsesRN(state, elementName)
  }

  const passedProps = arrayExprToStringArray(t, passedPropsExpr)
  const shouldForwardRef = passedProps.includes('ref')

  const jsxAttributes = []
  passedProps.forEach((prop) => {
    const isAttrWebSafe =
      platform === 'web' && htmlElements.has(elementName) ? isAttributeWebSafe(prop) : true
    if (prop !== 'zacs:inherit' && prop !== 'zacs:style' && prop !== 'ref' && isAttrWebSafe) {
      jsxAttributes.push(
        jsxAttr(t, prop, t.memberExpression(t.identifier('props'), t.identifier(prop))),
      )
    }
  })

  if (shouldForwardRef) {
    jsxAttributes.push(jsxAttr(t, 'ref', t.identifier('ref')))
  }

  jsxAttributes.unshift(
    ...styleAttributes(t, platform, uncondStyles, condStyles, literalStyleSpec, null, passedProps),
  )

  const jsxId = jsxName(t, elementName, isBuiltin)

  const component = t.arrowFunctionExpression(
    shouldForwardRef ? [t.identifier('props'), t.identifier('ref')] : [t.identifier('props')],
    t.jSXElement(
      t.jSXOpeningElement(jsxId, jsxAttributes),
      t.jSXClosingElement(jsxId),
      propsChildren(t),
    ),
  )

  return shouldForwardRef ? forwardRef(t, component) : component
}

module.exports = { createZacsComponent }
