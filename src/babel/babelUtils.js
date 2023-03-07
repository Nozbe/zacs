const { types: t } = require('@babel/core')

// equivalent to {...a, ...b, ...c}
//
// Pass isFirstObjectNonNull = true if you know the first argument is an object. This creates smaller,
// and more efficient code, but will throw an error if the first argument is not an object.
//
// NOTE: We use Object.assign(), because most users don't have this in their babel config:
//    ['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }]
// which would make spreads inefficient. I'm also not sure if native spreads are faster than Object.assign?
// TODO: If native spread is faster, add config option to use it instead of Object.assign()
function objectSpread(objectsToSpread, isFirstObjectNonNull = false) {
  const objects = objectsToSpread.slice()
  if (!isFirstObjectNonNull) {
    objects.unshift(t.objectExpression([]))
  }

  return t.callExpression(
    t.memberExpression(t.identifier('Object'), t.identifier('assign')),
    objects,
  )
}

module.exports = { objectSpread }
