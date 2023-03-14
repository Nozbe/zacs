exports.__esModule = true

const { types: t } = require('@babel/core')
const { transformStylesheet } = require('./stylesheet')
const { isZacsCssTaggedTemplate } = require('./stylesheet-utils')
const {
  isZacsDeclaration,
  validateZacsDeclaration,
  registerDeclaration,
  getDeclaration,
} = require('./declarations')
const { convertZacsElement } = require('./elements')
const { createZacsComponent } = require('./components')
const { handleResolve } = require('./resolveStyle')
const { handleImportDeclaration, injectNativeImportsIfNeeded } = require('./imports')
const { transformZacsAttributesOnNonZacsElement } = require('./nonZacsElements')

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

          if (zacsMethod === 'stylesheet' || zacsMethod === '_experimental_resolve') {
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

        const declaration = getDeclaration(path, state, name)
        if (declaration) {
          convertZacsElement(path, declaration, state)
        } else {
          transformZacsAttributesOnNonZacsElement(path, state)
        }
      },
      Program: {
        exit(path, state) {
          injectNativeImportsIfNeeded(path, state)
        },
      },
      CallExpression(path, state) {
        const { node } = path
        if (
          t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.object, { name: 'zacs' }) &&
          t.isIdentifier(node.callee.property, { name: '_experimental_resolve' })
        ) {
          handleResolve(path, state)
        }
      },
      ImportDeclaration(path, state) {
        handleImportDeclaration(path, state)
      },
      TaggedTemplateExpression(path) {
        const { node } = path

        // Strip zacs.css`` tag (only an annotation for editor highlighting)
        if (isZacsCssTaggedTemplate(node)) {
          path.replaceWith(node.quasi)
        }
      },
    },
  }
}
