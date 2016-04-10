
module.exports = {
  output: {
    filename: '[name].js',
  },
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
  }
};
