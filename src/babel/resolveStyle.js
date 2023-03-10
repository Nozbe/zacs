const { types: t } = require('@babel/core')

function resolveStyle(_path, _state) {
  // const { node } = path
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
