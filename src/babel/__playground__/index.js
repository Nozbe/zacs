const babel = require('@babel/core')
const path = require('path')
const chalk = require('chalk')
const fs = require('fs')
const { highlight } = require('cli-highlight')
const plugin = require('../index')

const isNative = process.argv.includes('--native')

function transform(input, platform, extra = {}) {
  const { code } = babel.transform(input, {
    configFile: false,
    plugins: ['@babel/plugin-syntax-jsx', [plugin, { platform, ...extra }]],
  })
  return code
}

// change console.{log,warn,error} so that it shows up differently
;['log', 'error', 'warn'].forEach(method => {
  // eslint-disable-next-line
  const orig = console[method]
  // eslint-disable-next-line
  console[method] = (...args) => {
    switch (method) {
      case 'log':
        process.stdout.write(chalk.blue('\n\x07  ===>  console.log <===   \n'))
        break
      case 'warn':
        process.stdout.write(chalk.yellow('\n\x07  ===>  console.process <===   \n'))
        break
      case 'error':
        process.stdout.write(chalk.red('\n\x07  ===>  console.error <===   \n'))
        break
      default:
        break
    }
    orig(...args)
    process.stdout.write('\n')
  }
})

// clear screen
process.stdout.write('\u001b[2J\u001b[0;0H')

// print transformed file
const playground = fs.readFileSync(path.resolve(__dirname, 'playground.js')).toString()
const transformed = transform(playground, isNative ? 'native' : 'web')

// eslint-disable-next-line no-console
process.stdout.write(highlight(transformed, { language: 'javascript' }))
