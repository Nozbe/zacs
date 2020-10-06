/* eslint-disable */

function displayZacsError(methodName) {
  return function zacsRuntimePlaceholder() {
    return function zacsPlaceholderComponent() {
      console.log(`zacs arguments passed:`, arguments)
      throw new Error(
        'zacs.' +
          methodName +
          'method was called directly (was not transpiled into zero-abstraction-cost form). This is an error. Most likely, you have a syntax error, your Babel configuration file is misconfigured, or you incorrectly use ZACS declarations as component objects. In fact, unless you pass { keepDeclarations: true } to ZACS Babel config, you should never see this file in the compiled app. See https://github.com/Nozbe/zacs#troubleshooting for more information.',
      )
    }
  }
}

module.exports = {
  view: displayZacsError('view'),
  text: displayZacsError('text'),
  styled: displayZacsError('styled'),
  createView: displayZacsError('createView'),
  createText: displayZacsError('createText'),
  createStyled: displayZacsError('createStyled'),
}
