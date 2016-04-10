var webpack = require('webpack');
var env = process.env.NODE_ENV;
var reactExternal = {
  root: 'React',
  commonjs2: 'react',
  commonjs: 'react',
  amd: 'react'
}
var immutableExternal = {
  root: 'React',
  commonjs2: 'react',
  commonjs: 'react',
  amd: 'react'
}

module.exports = {
  output: {
    filename: '[name].js',
  },
  externals: [{
  	immutable: 'window.Immutable',
    react: 'window.React'
  }],
  module: {
  	loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'react', 'stage-0'],
        plugins: ['add-module-exports'],
      }
    }]
   },
   plugins: [
     {
       apply: function apply(compiler) {
         compiler.parser.plugin('expression global', function expressionGlobalPlugin() {
           this.state.module.addVariable('global', "(function() { return this; }()) || Function('return this')()")
           return false
         })
       }
     },
     new webpack.optimize.OccurenceOrderPlugin(),
     new webpack.DefinePlugin({
       'process.env.NODE_ENV': JSON.stringify(env)
     })
   ]
};
