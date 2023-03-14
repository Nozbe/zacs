const { types: t } = require('@babel/core')
const { getPlatform, getTarget } = require('./state')
const { resolveShorthandsCSS } = require('./stylesheet-css')
const { resolveShorthandsRN } = require('./stylesheet-rn')
const { isZacsStylesheetLiteral } = require('./stylesheet-utils')

// TODO: Deduplicate
function isPlainObjectProperty(node, allowStringLiterals) {
  const isAllowedKey =
    t.isIdentifier(node.key) || (allowStringLiterals && t.isStringLiteral(node.key))
  return (
    t.isObjectProperty(node) && isAllowedKey && !node.shorthand && !node.computed && !node.method
  )
}

function resolveShorthands(key, node, state) {
  const platform = getPlatform(state)

  if (platform === 'web') {
    return resolveShorthandsCSS(key, node)
  } else if (platform === 'native') {
    return resolveShorthandsRN(key, node)
  }

  throw new Error('Unknown platform')
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

  const pushProp = (property) => {
    if (isZacsStylesheetLiteral(property.value)) {
      // strip ZACS_STYLESHEET_LITERAL(x)
      const [wrappedValue] = property.value.arguments
      property.value = wrappedValue
    }
    resolvedProperties.push(property)
  }
  const pushFromObject = (object) => {
    Object.entries(object).forEach(([key, value]) => {
      pushProp(
        t.objectProperty(
          t.identifier(key),
          typeof value === 'string' ? t.stringLiteral(value) : value,
        ),
      )
    })
  }

  const pushPropOrShorthands = (property) => {
    const shorthandLines = resolveShorthands(property.key.name, property.value, state)
    if (shorthandLines) {
      pushFromObject(shorthandLines)
    } else {
      pushProp(property)
    }
  }
  const pushFromProperty = (nestedScope) => {
    // TODO: validate
    nestedScope.value.properties.forEach((property) => {
      // TODO: further nestings?
      pushPropOrShorthands(property)
    })
  }

  path.get('properties').forEach((propertyPath) => {
    const property = propertyPath.node

    // TODO: Can we allow non-standard properties in this context?
    if (!isPlainObjectProperty(property)) {
      resolvedProperties.push(property)
      return
    }

    const key = property.key.name
    if (key === 'css' || key === '_mixin') {
      throw propertyPath.buildCodeFrameError(`'${key}' is not a valid style property`)
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
