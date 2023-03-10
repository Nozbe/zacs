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
function concatArraysOfObjects(inputArray, right) {
  const array = inputArray.filter(Boolean)
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

const identifierRegex = /^[a-zA-Z][a-zA-Z0-9]*$/
function objectKey(key) {
  if (typeof key === 'string' && identifierRegex.test(key)) {
    return t.identifier(key)
  } else if (typeof key === 'number') {
    return t.numericLiteral(key)
  }
  return t.stringLiteral(String(key))
}

// Converts an array of [string, node] pairs into an object expression
function objectExpressionFromPairs(keyValuePairs) {
  return t.objectExpression(
    keyValuePairs.map(([key, value]) => t.objectProperty(objectKey(key), value)),
  )
}

// Returns a deduplicated list of object properties
// (Nodes other than properties are left as-is)
function deduplicatedProperties(objectProperties) {
  // Note: we're doing double-reverse instead of adding to map because we want to preserve order
  // of the LAST property, not the first one
  const output = []
  const seen = new Set()
  objectProperties.reverse().forEach((node) => {
    if (node.key && node.key.name) {
      // looks property-ish
      const { name } = node.key
      if (seen.has(name)) {
        return
      }
      seen.add(name)
      output.push(node)
    } else {
      output.push(node)
    }
  })
  return output.reverse()
}

const unshiftComments = (node, type, comments) => {
  const key = `${type}Comments`
  if (!node[key]) {
    node[key] = []
  }
  node[key].unshift(...comments)
  return node
}

// NOTE: Adding comments in Babel is a bit tricky (they should be put into leading/trailing/innerComments,
// depending on where they are in relation to other AST nodes), so when trying to preserve comments
// of deleted nodes, we just add comment nodes to an array incorrectly and here we're trying to recreate the
// proper placement
function preserveComments(parent, childNodes) {
  const output = []
  let pendingComments = []
  childNodes.forEach((node) => {
    if (node.type.startsWith('Comment')) {
      pendingComments.push(node)
      return
    }

    // Add any pending comments to the following node as leading comments
    if (pendingComments.length) {
      unshiftComments(node, 'leading', pendingComments)
      pendingComments = []
    }

    output.push(node)
  })

  if (!pendingComments) {
    return output
  }

  // Add any pending comments to the last node as trailing comments if possible
  const lastNode = output[output.length - 1]
  if (lastNode) {
    unshiftComments(lastNode, 'trailing', pendingComments)
    return output
  }

  // Otherwise add them as inner comments to the parent node
  unshiftComments(parent, 'inner', pendingComments)
  return output
}

module.exports = {
  mergeObjects,
  concatArraysOfObjects,
  objectExpressionFromPairs,
  deduplicatedProperties,
  preserveComments,
}
