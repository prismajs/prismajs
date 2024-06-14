const path = require('path');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './resources/js/app.js',
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'bundle.js',
    publicPath: '/js/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx','mjs'],
  },
  plugins: [
    new WebpackManifestPlugin({
      fileName: 'manifest.json',
      publicPath: '/js/',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 8080,
    proxy: [
        {
            context: ['/api'],
            target: 'http://localhost:3001',
            changeOrigin: true,
        }
    ],
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
