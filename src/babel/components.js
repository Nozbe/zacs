const { types: t } = require('@babel/core')
const { htmlElements } = require('./attributes')
const { getPlatform } = require('./state')
const { jsxName, jsxAttr } = require('./jsxUtils')
const { getElementName } = require('./declarations')
const { isAttributeWebSafe, styleAttributes } = require('./elements')
const { setUsesRN } = require('./imports')

function propsChildren() {
  return [
    t.jSXExpressionContainer(t.memberExpression(t.identifier('props'), t.identifier('children'))),
  ]
}

function forwardRef(component) {
  return t.callExpression(t.memberExpression(t.identifier('React'), t.identifier('forwardRef')), [
    component,
  ])
}

const createMethodToZacsMethod = {
  createView: 'view',
  createText: 'text',
  createStyled: 'styled',
}

function arrayExprToStringArray(expr) {
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

function createZacsComponent(state, path) {
  const { node } = path
  const { init } = node
  const platform = getPlatform(state)

  const zacsMethod = createMethodToZacsMethod[init.callee.property.name]
  const [elementName, isBuiltin] = getElementName(
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

  const passedProps = arrayExprToStringArray(passedPropsExpr)
  const shouldForwardRef = passedProps.includes('ref')

  const jsxAttributes = []
  passedProps.forEach((prop) => {
    const isAttrWebSafe =
      platform === 'web' && htmlElements.has(elementName) ? isAttributeWebSafe(prop) : true
    if (prop !== 'zacs:inherit' && prop !== 'zacs:style' && prop !== 'ref' && isAttrWebSafe) {
      jsxAttributes.push(
        jsxAttr(prop, t.memberExpression(t.identifier('props'), t.identifier(prop))),
      )
    }
  })

  if (shouldForwardRef) {
    jsxAttributes.push(jsxAttr('ref', t.identifier('ref')))
  }

  jsxAttributes.unshift(
    ...styleAttributes(state, { uncondStyles, condStyles, literalStyleSpec }, null, passedProps),
  )

  const jsxId = jsxName(elementName, isBuiltin)

  const component = t.arrowFunctionExpression(
    shouldForwardRef ? [t.identifier('props'), t.identifier('ref')] : [t.identifier('props')],
    t.jSXElement(
      t.jSXOpeningElement(jsxId, jsxAttributes),
      t.jSXClosingElement(jsxId),
      propsChildren(),
    ),
  )

  return shouldForwardRef ? forwardRef(component) : component
}

module.exports = { createZacsComponent }
