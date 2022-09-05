function getPlatform(state) {
  // return 'web'
  // return 'native'
  const { platform } = state.opts
  if (!platform) {
    throw new Error('platform option is required for ZACS babel plugin')
  }
  if (platform !== 'web' && platform !== 'native') {
    throw new Error(
      'illegal platform option passed to ZACS babel plugin. allowed values: web, native',
    )
  }
  return platform
}

function getTarget(state) {
  // return 'ios'
  // return 'android'
  const { target } = state.opts
  if (target && !['ios', 'android', 'web'].includes(target)) {
    // eslint-disable-next-line no-console
    console.warn(
      'Unrecognized target passed to ZACS babel plugin. Known targets: web, ios, android',
    )
  }
  return target
}

function isProduction(state) {
  // return true
  // return false
  const { production } = state.opts
  return !!production
}

module.exports = { getPlatform, getTarget, isProduction }
