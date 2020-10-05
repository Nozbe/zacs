const babel = require('@babel/core')
const path = require('path')
const fs = require('fs')
const { highlight } = require('cli-highlight')
const plugin = require('../index')

function transform(input, platform, extra = {}) {
  const { code } = babel.transform(input, {
    configFile: false,
    plugins: ['@babel/plugin-syntax-jsx', [plugin, { platform, ...extra }]],
  })
  return code
}

describe('ZACS playground', () => {
  it('Running playground…', () => {
    const playground = fs.readFileSync(path.resolve(__dirname, 'playground.js')).toString()
    const transformed = transform(playground, 'web')

    // eslint-disable-next-line no-console
    console.log(highlight(transformed, { language: 'javascript' }))
  })
})
