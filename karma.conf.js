var webpack = require('webpack');

module.exports = function(config) {
  config.set({

    browsers: ['PhantomJS'],

    singleRun: !!process.env.CI,

    frameworks: ['mocha'],

    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      process.env.WEBPACK_DLLS === '1' && './static/dist/dlls/dll__vendor.js',
      'tests.webpack.js'
    ].filter(function(x) { return !!x; }),

    preprocessors: {
      'tests.webpack.js': ['webpack', 'sourcemap']
    },

    reporters: ['mocha'],

    plugins: [
      require("karma-webpack"),
      require("karma-mocha"),
      require("karma-mocha-reporter"),
      require("karma-phantomjs-launcher"),
      require("karma-sourcemap-loader")
    ],

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loaders: ['babel'] },
        ]
      },
      resolve: {
        modulesDirectories: [
          'src',
          'node_modules'
        ],
        extensions: ['', '.js']
      },
      plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
          __DEVELOPMENT__: true,
          __DLLS__: process.env.WEBPACK_DLLS === '1'
        })
      ]
    },

    webpackServer: {
      noInfo: true
    }

  });
};
