const { types: t } = require('@babel/core')

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
    !['text', 'view', 'styled', 'createText', 'createView', 'createStyled', 'stylesheet'].includes(
      zacsMethod,
    )
  ) {
    throw path.buildCodeFrameError(
      `zacs.${init.callee.property.name} is not a valid zacs declaration`,
    )
  }

  if (zacsMethod === 'stylesheet') {
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
      throw path.buildCodeFrameError(
        'zacs.styled() requires an argument - a `Component`, `Namespaced.Component`, a `{ web: Component, native: Component }` specifier, or a `"builtin"` (e.g. `"div"` on web)',
      )
    }
  }

  const [, condStyles, literalStyleSpec] =
    zacsMethod === 'styled' || zacsMethod === 'createStyled'
      ? init.arguments.slice(1)
      : init.arguments

  if (condStyles && !(t.isObjectExpression(condStyles) || t.isNullLiteral(condStyles))) {
    throw path.buildCodeFrameError(
      'Conditional styles (second argument to ZACS) should be an object expression',
    )

    // TODO: Validate keys / values too
  }

  if (
    literalStyleSpec &&
    !(t.isObjectExpression(literalStyleSpec) || t.isNullLiteral(literalStyleSpec))
  ) {
    throw path.buildCodeFrameError(
      'Literal styles (third argument to ZACS) should be an object expression',
    )

    // TODO: Validate keys / values too
  }
}

const declarationStateKey = (name) => `declaration_${name}`

function registerDeclaration(path, state) {
  const { node } = path

  const id = node.id.name
  const stateKey = declarationStateKey(id)
  if (state.get(stateKey)) {
    throw path.buildCodeFrameError(`Duplicate ZACS declaration for name: ${id}`)
  }
  state.set(stateKey, node)

  if (!state.opts.keepDeclarations) {
    path.remove()
  }
}

function getDeclaration(path, state, name) {
  const stateKey = declarationStateKey(name)
  const declaration = state.get(stateKey)
  return declaration
}

module.exports = { isZacsDeclaration, validateZacsDeclaration, registerDeclaration, getDeclaration }
