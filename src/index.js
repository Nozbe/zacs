/* eslint-disable */

function throwError(args, methodName) {
  console.log(`zacs arguments passed:`, args)
  throw new Error(
    'zacs.' +
      methodName +
      'method was called directly (was not transpiled into zero-abstraction-cost form). This is an error. Most likely, you have a syntax error, your Babel configuration file is misconfigured, or you incorrectly use ZACS declarations as component objects. In fact, unless you pass { keepDeclarations: true } to ZACS Babel config, you should never see this file in the compiled app. See https://github.com/Nozbe/zacs#troubleshooting for more information.',
  )
}

function makeZacsErrorFunction(methodName) {
  return function zacsRuntimePlaceholder() {
    throwError(arguments, methodName)
  }
}

function makeZacsErrorComponent(methodName) {
  return function zacsRuntimePlaceholder() {
    const args = arguments
    return function zacsRuntimePlaceholderInner() {
      throwError(args, methodName)
    }
  }
}

module.exports = {
  view: makeZacsErrorComponent('view'),
  text: makeZacsErrorComponent('text'),
  styled: makeZacsErrorComponent('styled'),
  createView: makeZacsErrorComponent('createView'),
  createText: makeZacsErrorComponent('createText'),
  createStyled: makeZacsErrorComponent('createStyled'),
  stylesheet: makeZacsErrorFunction('stylesheet'),
  css: makeZacsErrorFunction('css'),
}
