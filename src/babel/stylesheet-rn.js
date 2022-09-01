const { getTarget } = require('./state')

// ZACS_STYLESHEET_LITERAL(xxx) - magic syntax that passes validation
// for use by babel plugins that transform dynamic expressions into static literals
function isZacsStylesheetLiteral(t, node) {
  return (
    t.isCallExpression(node) && t.isIdentifier(node.callee, { name: 'ZACS_STYLESHEET_LITERAL' })
  )
}

function resolveRNStylesheet(t, target, stylesheet) {
  stylesheet.properties = stylesheet.properties
    .filter(styleset => styleset.key.name !== 'css')
    .map(styleset => {
      const resolvedProperties = []
      const pushProp = property => {
        if (isZacsStylesheetLiteral(t, property.value)) {
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

function transformStylesheetRN(t, path, stylesheet, state) {
  state.set(`uses_rn`, true)
  state.set(`uses_rn_stylesheet`, true)

  const target = getTarget(state)

  const resolvedRules = resolveRNStylesheet(t, target, stylesheet)
  const rnStylesheet = t.callExpression(
    t.memberExpression(t.identifier('ZACS_RN_StyleSheet'), t.identifier('create')),
    [resolvedRules],
  )
  path.get('init').replaceWith(rnStylesheet)
}

module.exports = { transformStylesheetRN, isZacsStylesheetLiteral }
