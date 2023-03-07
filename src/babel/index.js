exports.__esModule = true

const { types: t } = require('@babel/core')
const { getPlatform } = require('./state')
const { jsxAttr, jsxFindNamespacedAttr } = require('./jsxUtils')
const { transformStylesheet } = require('./stylesheet')
const {
  isZacsDeclaration,
  validateZacsDeclaration,
  registerDeclaration,
  getDeclaration,
} = require('./declarations')
const { convertZacsElement } = require('./elements')
const { createZacsComponent } = require('./components')
const { handleImportDeclaration, injectNativeImportsIfNeeded } = require('./imports')

function transformZacsAttributesOnNonZacsElement(platform, path) {
  // this is called on a JSXElement that doesn't (directly) reference a zacs declaration
  // we need to spread zacs:inherit and zacs:style into separate props or it won't work
  const { node } = path
  const { openingElement } = node

  const inheritedPropsAttr = jsxFindNamespacedAttr(openingElement.attributes, 'inherit')
  const zacsStyleAttr = jsxFindNamespacedAttr(openingElement.attributes, 'style')
  if (!inheritedPropsAttr && !zacsStyleAttr) {
    return
  }

  const addedAttrs = []

  if (inheritedPropsAttr) {
    const inheritedProps = inheritedPropsAttr.value.expression
    const styleAttr = jsxAttr('style', t.memberExpression(inheritedProps, t.identifier('style')))
    addedAttrs.push(styleAttr)

    if (platform === 'web') {
      const classNameAttr = jsxAttr(
        'className',
        t.memberExpression(inheritedProps, t.identifier('className')),
      )
      addedAttrs.push(classNameAttr)
    }
  }

  if (zacsStyleAttr) {
    // rewrite zacs:style to __zacs_style, otherwise React babel plugin will have a problem
    addedAttrs.push(jsxAttr('__zacs_style', zacsStyleAttr.value.expression))
  }

  openingElement.attributes = openingElement.attributes
    .filter((attr) => attr !== inheritedPropsAttr && attr !== zacsStyleAttr)
    .concat(addedAttrs)
}

exports.default = function () {
  return {
    name: 'zacs',
    visitor: {
      VariableDeclarator: {
        enter(path, state) {
          if (!isZacsDeclaration(path.node)) {
            return
          }

          validateZacsDeclaration(path)

          const { node } = path
          const { init } = node
          const zacsMethod = init.callee.property.name

          if (zacsMethod === 'stylesheet') {
            // do nothing, will process on exit
            // eslint-disable-next-line no-useless-return
            return
          } else if (zacsMethod.startsWith('create')) {
            node.init = createZacsComponent(state, path)
          } else {
            registerDeclaration(path, state)
          }
        },
        // Stylesheets must be processed on exit so that other babel plugins that transform
        // inline expressions into literals can do their work first
        // TODO: Deduplicate
        exit(path, state) {
          if (!isZacsDeclaration(path.node)) {
            return
          }

          const zacsMethod = path.node.init.callee.property.name
          if (zacsMethod !== 'stylesheet') {
            return
          }
          transformStylesheet(state, path)
        },
      },
      JSXElement(path, state) {
        const { node } = path
        const { openingElement } = node
        const { name } = openingElement.name
        const platform = getPlatform(state)

        // check if it's a ZACS element
        const declaration = getDeclaration(path, state, name)
        if (!declaration) {
          transformZacsAttributesOnNonZacsElement(platform, path)
          return
        }

        convertZacsElement(path, declaration, state)
      },
      Program: {
        exit(path, state) {
          injectNativeImportsIfNeeded(path, state)
        },
      },
      ImportDeclaration(path, state) {
        handleImportDeclaration(path, state)
      },
      TaggedTemplateExpression(path) {
        const { node } = path
        const { tag } = node

        // Strip zacs.css`` tag (only an annotation for editor highlighting)
        if (
          !(
            t.isMemberExpression(tag) &&
            t.isIdentifier(tag.object, { name: 'zacs' }) &&
            t.isIdentifier(tag.property, { name: 'css' })
          )
        ) {
          return
        }

        path.replaceWith(node.quasi)
      },
    },
  }
}
