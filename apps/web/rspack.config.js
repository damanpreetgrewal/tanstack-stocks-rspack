import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import rspack from '@rspack/core';
// import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({ template: './public/index.html' }),
    TanStackRouterRspack({ target: 'react', autoCodeSplitting: true }),
  ],
  devServer: {
    port: 4200,
    hot: true,
    historyApiFallback: true,
  },
  devtool: 'eval-cheap-module-source-map',
};