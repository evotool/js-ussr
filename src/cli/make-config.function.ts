/* eslint-disable import/default, import/no-import-module-exports */
import CopyPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import NodemonPlugin from 'nodemon-webpack-plugin';
import { join } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import {
  type Configuration,
  DefinePlugin,
  type ModuleOptions,
  SourceMapDevToolPlugin,
} from 'webpack';

import { svgSass } from './svg-sass.function';

export const makeConfig = (mode: string, pwd: string): Configuration[] => {
  const isProd = mode === 'production';
  const cwd = (path?: string): string => path ? join(pwd, path) : pwd;
  const tsconfigPath = cwd('tsconfig.json');

  dotenv.config({
    path: cwd('.env'),
    override: true,
  });

  const dotenvFile = cwd(`.env.${mode}`);

  if (existsSync(dotenvFile)) {
    dotenv.config({
      path: dotenvFile,
      override: true,
    });
  }

  const commonConfig: Configuration = {
    mode: isProd ? 'production' : 'development',
    stats: 'errors-only',
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    optimization: {
      splitChunks: {
        chunks: 'async',
      },
      // runtimeChunk: 'single',
      // splitChunks: {
      //   cacheGroups: {
      //     vendor: {
      //       test: /node_modules/,
      //       name: 'vendor',
      //       chunks: 'all',
      //     },
      //   },
      // },
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: tsconfigPath,
        }),
      ],
      alias: {
        'react': 'preact/compat',
        'react-dom': 'preact/compat',
      },
    },
  };

  const commonRules: ModuleOptions['rules'] = [
    {
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            configFile: tsconfigPath,
            transpileOnly: true,
          },
        },
      ],
      exclude: /node_modules/,
    },
  ];

  const commonPlugins = [
    new DefinePlugin(
      Object.entries(process.env)
        .filter(([k]) => k.startsWith('EVO_'))
        .reduce((o, [k, v]) => {
          o[`import.meta.env.${k}`] = `"${v}"`;

          return o;
        }, {}),
    ),
    new MiniCssExtractPlugin({
      filename: 'app.css',
    }),
    isProd
      ? null
      : new SourceMapDevToolPlugin({
        filename: '[file].map',
        exclude: ['vendor.js'],
        sourceRoot: '../',
        moduleFilenameTemplate: '[resource-path]',
        fallbackModuleFilenameTemplate: '[resource-path]',
      }),
  ].filter(Boolean);

  const cssLoaderModules = {
    auto: true,
    mode: 'local',
    localIdentName: isProd ? '[hash:base64:8]' : '[local]_[hash:base64:8]',
  };

  const sassLoaderOptions = {
    sourceMap: !isProd,
    sassOptions: {
      includePaths: [cwd()],
      functions: {
        ...svgSass(cwd()),
      },
    },
  };

  return [
    {
      ...commonConfig,
      target: 'node',
      entry: cwd('src/server.tsx'),
      devtool: false,
      output: {
        filename: 'main.js',
        path: cwd('dist/'),
        clean: false,
        devtoolModuleFilenameTemplate: '[resource-path]',
        devtoolFallbackModuleFilenameTemplate: '[resource-path]',
      },
      plugins: [
        ...commonPlugins,
        new NodemonPlugin({
          script: cwd('dist/main.js'),
          watch: [cwd('dist/')],
        }),
      ],
      module: {
        rules: [
          ...commonRules,
          {
            test: /\.(css|scss|sass)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: { emit: false },
              },
              {
                loader: 'css-loader',
                options: {
                  modules: cssLoaderModules,
                  url: false,
                },
              },
              {
                loader: 'sass-loader',
                options: sassLoaderOptions,
              },
            ],
          },
        ],
      },
    },
    {
      ...commonConfig,
      target: 'web',
      entry: {
        app: cwd('src/browser.tsx'),
      },
      devtool: false,
      output: {
        filename: 'app.js',
        path: cwd('dist/public/'),
        clean: false,
        devtoolModuleFilenameTemplate: '[resource-path]',
        devtoolFallbackModuleFilenameTemplate: '[resource-path]',
      },
      module: {
        rules: [
          ...commonRules,
          {
            test: /\.(css|scss|sass)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {},
              },
              {
                loader: 'css-loader',
                options: {
                  modules: cssLoaderModules,
                  url: { filter: (url) => !url.startsWith('/') },
                },
              },
              {
                loader: 'sass-loader',
                options: sassLoaderOptions,
              },
            ],
          },
        ],
      },
      plugins: [
        ...commonPlugins,
        new CopyPlugin({
          patterns: [
            {
              from: cwd('public/'),
              to: cwd('dist/public/'),
            },
          ],
          options: {
            concurrency: 100,
          },
        }),
      ],
    },
  ];
};
