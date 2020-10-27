const webpack = require('webpack')
const { createFsFromVolume, Volume } = require('memfs')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const compile = (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'static/[name].css',
        chunkFilename: 'static/[name].[hash].css',
      }),
    ],
    optimization: {
      minimize: false
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            // {
            //   loader: 'babel-loader',
            //   options: {},
            // },
            {
              loader: path.resolve(__dirname, '../loader.js'),
              options,
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            // {
            //   loader: 'style-loader',
            //   options: {
            //     injectType: 'singletonStyleTag',
            //   },
            // },
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // hmr: process.env.NODE_ENV !== 'production',
              },
            },
            {
              loader: 'css-loader',
              options: {
                // importLoaders: 1,
                // sourceMap: process.env.NODE_ENV !== 'production',
              },
            },
          ],
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

describe('zacs-loader', () => {
  it(`extracts CSS`, async () => {
    const stats = await compile('examples/basic.js')
    // console.log(stats.compilation.modules)
    // console.log(stats.compilation.assets)
    // console.log(json.modules)

    // expect(Object.keys(stats.compilation.assets).length).toBe(2)
    // expect(stats.compilation.assets['static/main.css'].source()).toMatchSnapshot()

    const modules = stats.compilation.modules
    expect(modules.length).toBe(3)
    const js = modules.find(m => m.rawRequest === './examples/basic.js')._source._value
    console.log(js)

    const css = modules.find(m => m.constructor.name === 'CssModule').content
    console.log(css)

    const cssShim = modules.find(m => m.rawRequest.endsWith('/basic.zacs.css'))._source._value
    console.log(cssShim)
  })
})
