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
    const json = stats.toJson()
    // console.log(stats.toJson())
    // console.log(json.assets)
    console.log(stats.compilation.modules)
    // console.log(stats.compilation.assets)
    console.log(json.modules)
    // console.log(json.modules[1].source)

    expect(Object.keys(stats.compilation.assets).length).toBe(2)
    expect(stats.compilation.assets['static/main.css'].source()).toMatchSnapshot()


    const output = json.modules[0].source
    expect(output).toBe('export default "Hello Alice!"')
  })
})
