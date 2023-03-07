const { types: t } = require('@babel/core')

// Creates an expression that merges (spreads) multiple optional objects together
// into a single optional object.
//
// Roughly equivalent to {...a, ...b, ...c}, however the result can be null
//
// Pass isFirstObjectNonNull = true if you know the first argument is an object. This creates smaller,
// and more efficient code, but will throw an error if the first argument is not an object.
function mergeObjects(optionalObjects) {
  const objects = optionalObjects.filter((node) => {
    return node && !t.isNullLiteral(node)
  })

  if (!objects.length) {
    return null
  } else if (objects.length === 1) {
    return objects[0]
  }

  // If we don't know for sure that the first element is an object, we need to add an empty object
  // as to not break Object.assign
  const isFirstObjectNonNull = t.isObjectExpression(objects[0])
  if (!isFirstObjectNonNull) {
    objects.unshift(t.objectExpression([]))
  }

  // NOTE: We use Object.assign(), because most users don't have this in their babel config:
  //    ['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }]
  // which would make spreads inefficient. I'm also not sure if native spreads are faster than Object.assign?
  // TODO: If native spread is faster, add config option to use it instead of Object.assign()
  return t.callExpression(
    t.memberExpression(t.identifier('Object'), t.identifier('assign')),
    objects,
  )
}

// Given Node[] and ?Node that represents ?(object | object[]), returns an expression that represents:
//
// [arrayEl, arrayEl].concat(foo || [])
//
// This will evaluate at runtime to an array of objects
function concatArraysOfObjects(array, right) {
  const arrayLength = array.length

  if (arrayLength && right) {
    // `[{}, {}].concat(foo || [])`
    return t.callExpression(t.memberExpression(t.arrayExpression(array), t.identifier('concat')), [
      t.logicalExpression('||', right, t.arrayExpression([])),
    ])
  } else if (arrayLength && !right) {
    // `{}` or `[{}, {}]`
    return array.length === 1 ? array[0] : t.arrayExpression(array)
  } else if (!arrayLength && right) {
    // `foo`
    return right
  }

  return null
}

module.exports = { mergeObjects, concatArraysOfObjects }
