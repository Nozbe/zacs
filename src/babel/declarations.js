const { types: t } = require('@babel/core')
const { getPlatform, isProduction } = require('./state')
const { setUsesRN } = require('./imports')

// is ANY kind of zacs declaration (zacs.text, zacs.createX, zacs.stylesheet)
function isZacsDeclaration(node) {
  if (!t.isVariableDeclarator(node)) {
    return false
  }
  const { init } = node
  if (!t.isCallExpression(init)) {
    return false
  }
  const {
    callee: { object, property },
  } = init

  if (!(t.isIdentifier(object, { name: 'zacs' }) && t.isIdentifier(property))) {
    return false
  }

  return true
}

function validateZacsDeclaration(path) {
  const { node } = path
  const { init } = node
  const zacsMethod = init.callee.property.name

  // Validate variable name

  if (!t.isIdentifier(node.id)) {
    throw path.buildCodeFrameError('Expected zacs declaration to be assigned to a simple variable')
  }

  // Validate declaration
  if (
    ![
      'text',
      'view',
      'styled',
      'createText',
      'createView',
      'createStyled',
      'stylesheet',
      '_experimental_resolve',
    ].includes(zacsMethod)
  ) {
    throw path.buildCodeFrameError(
      `zacs.${init.callee.property.name} is not a valid zacs declaration`,
    )
  }

  if (zacsMethod === 'stylesheet' || zacsMethod === '_experimental_resolve') {
    return
  }

  if (!zacsMethod.startsWith('create')) {
    // TODO: It's not very reliable, as you could define first, export later...
    // declarator -> declaration -> export declaration
    if (t.isExportDeclaration(path.parentPath.parent)) {
      throw path.buildCodeFrameError(
        `It's not allowed to export zacs declarations. You can export zacs components (use zacs.createView/createText/createStyled), however they behave a little differently -- please check documentation for more information.`,
      )
    }
  }

  if (zacsMethod === 'styled') {
    const componentToStyle = init.arguments[0]
    if (
      !(
        init.arguments.length >= 1 &&
        (t.isIdentifier(componentToStyle) ||
          // e.g. Foo.Bar
          (t.isMemberExpression(componentToStyle) &&
            t.isIdentifier(componentToStyle.object) &&
            t.isIdentifier(componentToStyle.property)) ||
          // builtin, e.g. 'div'
          t.isStringLiteral(componentToStyle) ||
          // {web:x, native:y} TODO: Validate platform specifier keys
          t.isObjectExpression(componentToStyle))
      )
    ) {
      throw path
        .get('init')
        .buildCodeFrameError(
          'zacs.styled() requires an argument - a `Component`, `Namespaced.Component`, a `{ web: Component, native: Component }` specifier, or a `"builtin"` (e.g. `"div"` on web)',
        )
    }
  }

  const [, condStyles, literalStyleSpec] =
    zacsMethod === 'styled' || zacsMethod === 'createStyled'
      ? init.arguments.slice(1)
      : init.arguments

  if (condStyles && !(t.isObjectExpression(condStyles) || t.isNullLiteral(condStyles))) {
    throw path
      .get('init')
      .buildCodeFrameError(
        'Conditional styles (second argument to ZACS) should be an object expression',
      )

    // TODO: Validate keys / values too
  }

  if (
    literalStyleSpec &&
    !(t.isObjectExpression(literalStyleSpec) || t.isNullLiteral(literalStyleSpec))
  ) {
    throw path
      .get('init')
      .buildCodeFrameError('Literal styles (third argument to ZACS) should be an object expression')

    // TODO: Validate keys / values too
  }
}

const builtinElements = {
  web: {
    view: 'div',
    text: 'span',
  },
  native: {
    view: 'ZACS_RN_View',
    text: 'ZACS_RN_Text',
  },
}

// 'Foo' (uppercase) builtins need special treatment, hence second arg
function getElementName(platform, path, originalName, component) {
  // zacs.view, zacs.text
  if (typeof component === 'string') {
    const identifier = builtinElements[platform][component]
    return [identifier, false]
  }

  // zacs.styled()
  if (
    t.isMemberExpression(component) &&
    t.isIdentifier(component.object, { name: 'zacs' }) &&
    t.isIdentifier(component.property) &&
    ['text', 'view'].includes(component.property.name)
  ) {
    const identifier = builtinElements[platform][component.property.name]
    return [identifier, false]
  } else if (t.isIdentifier(component)) {
    return [component.name, false]
  } else if (t.isStringLiteral(component)) {
    return [component.value, true]
  } else if (t.isMemberExpression(component)) {
    // assuming it was already validated to be id.id
    const identifier = `${component.object.name}.${component.property.name}`
    return [identifier, false]
  } else if (t.isObjectExpression(component)) {
    const platformComponent = component.properties.find(
      (property) => property.key.name === platform,
    )

    if (!platformComponent) {
      throw path
        .get('init.arguments.0')
        .buildCodeFrameError(
          `Invalid component specifier in ZACS declaration - no ${platform} key specified for ${originalName}`,
        )
    }

    return getElementName(platform, path, originalName, platformComponent.value)
  }

  // This is checked before by validateZacsDeclaration
  throw new Error('unreachable')
}

function createDeclarationMetadata(path, state) {
  const platform = getPlatform(state)

  const { node } = path
  const { id, init } = node
  const originalName = id.name

  const zacsMethod = init.callee.property.name
  const [elementName, isBuiltin] = getElementName(
    platform,
    path,
    originalName,
    zacsMethod === 'styled' ? init.arguments[0] : zacsMethod,
  )
  const [uncondStyles, condStyles, literalStyleSpec] =
    zacsMethod === 'styled' ? init.arguments.slice(1) : init.arguments

  return {
    node,
    originalName,
    elementName,
    isBuiltin,
    uncondStyles,
    condStyles,
    literalStyleSpec,
  }
}

const declarationStateKey = (name) => `declaration_${name}`

function registerDeclaration(path, state) {
  const { node } = path

  const { name } = node.id
  const stateKey = declarationStateKey(name)
  if (state.get(stateKey)) {
    throw path.buildCodeFrameError(`Duplicate ZACS declaration for name: ${name}`)
  }

  const declaration = createDeclarationMetadata(path, state)
  state.set(stateKey, declaration)

  if (getPlatform(state) === 'native') {
    setUsesRN(state, declaration.elementName)
  }

  if (isProduction(state)) {
    path.remove()
  }
}

function getDeclaration(path, state, name) {
  const stateKey = declarationStateKey(name)
  const declaration = state.get(stateKey)
  return declaration
}

module.exports = {
  isZacsDeclaration,
  validateZacsDeclaration,
  registerDeclaration,
  getDeclaration,
  getElementName,
}
