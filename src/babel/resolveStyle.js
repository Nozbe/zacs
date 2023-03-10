const { types: t } = require('@babel/core')
const { getPlatform, getTarget } = require('./state')

// TODO: Deduplicate
function isPlainObjectProperty(node, allowStringLiterals) {
  const isAllowedKey =
    t.isIdentifier(node.key) || (allowStringLiterals && t.isStringLiteral(node.key))
  return (
    t.isObjectProperty(node) && isAllowedKey && !node.shorthand && !node.computed && !node.method
  )
}

// NOTE: This is somewhat similar to stylesheet-rn, but different.
// In this context, we have RN-like behavior on both web and native, i.e. things are computable
// at runtime (we can have expressions as values) and names are camelCase. Still, we should have
// as much code reuse as possible
function resolveStyle(path, state) {
  const { node } = path
  const platform = getPlatform(state)
  const target = getTarget(state)

  const resolvedProperties = []

  const pushPropOrShorthands = (property) => {
    resolvedProperties.push(property)
  }
  const pushFromProperty = (nestedScope) => {
    // TODO: validate
    nestedScope.value.properties.forEach((property) => {
      // TODO: further nestings?
      pushPropOrShorthands(property)
    })
  }

  node.properties.forEach((property) => {
    // TODO: Can we allow non-standard properties in this context?
    if (!isPlainObjectProperty(property)) {
      resolvedProperties.push(property)
      return
    }

    const key = property.key.name
    if (key === 'css') {
      throw path.buildCodeFrameError(`'css' is not a valid style property`)
    } else if (key === 'native' || key === 'web') {
      if (key === platform) {
        pushFromProperty(property)
      }
    } else if (key === 'ios' || key === 'android') {
      if (key === target) {
        pushFromProperty(property)
      }
    } else {
      pushPropOrShorthands(property)
    }
  })

  // TODO: Deduplicate, preserve comments
  node.properties = resolvedProperties
}

function handleResolve(path, state) {
  const { node } = path

  if (!(node.arguments.length === 1 && t.isObjectExpression(node.arguments[0]))) {
    throw path.buildCodeFrameError(
      `zacs._experimental_resolve() must be called with exactly one argument (the style object)`,
    )
  }

  resolveStyle(path.get('arguments.0'), state)
}

module.exports = {
  handleResolve,
  resolveStyle,
}
