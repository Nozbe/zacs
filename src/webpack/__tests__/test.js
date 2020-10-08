const webpack = require('webpack')
const { createFsFromVolume, Volume } = require('memfs')

const babel = require('@babel/core')
const path = require('path')
const fs = require('fs')
// const plugin = require('../index')

// function transform(input, platform, extra = {}) {
//   const { code } = babel.transform(input, {
//     configFile: false,
//     plugins: ['@babel/plugin-syntax-jsx', [plugin, { platform, ...extra }]],
//   })
//   return code
// }

const compile = (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.txt$/,
          use: {
            loader: path.resolve(__dirname, '../loader.js'),
            options,
          },
        },
        {
          test: /.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
      ],
    },
  })

  compiler.outputFileSystem = createFsFromVolume(new Volume())
  compiler.outputFileSystem.join = path.join.bind(path)

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err)
      }
      if (stats.hasErrors()) {
        reject(new Error(stats.toJson().errors))
      }

      resolve(stats)
    })
  })
}

// function example(name) {
//   return fs.readFileSync(path.resolve(__dirname, 'examples', `${name}.js`)).toString()
// }

describe('zacs-loader', () => {
  it(`loads`, async () => {
    const stats = await compile('examples/example.txt', { name: 'Alice' })
    const output = stats.toJson().modules[0].source
    expect(output).toBe('export default "Hello Alice!"')
  })
})
