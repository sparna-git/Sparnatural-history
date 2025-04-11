const webpack = require("webpack");
const path = require("path");
const WriteFilePlugin = require("write-file-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const CopyPlugin = require("copy-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");

const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  entry: {
    "sparnatural-history": "./src/SparnaturalHistoryElement.ts",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            allowTsInNodeModules: true,
          },
        },
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader", // translates CSS into CommonJS
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader", // compiles Sass to CSS
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader", // translates CSS into CommonJS
          },
        ],
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8000,
              // Convert images < 8kb to base64 strings
              // in case larger images are processed by file-loader
              name: "images/[hash]-[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    fallback: {
      util: require.resolve("util/"),
      buffer: require.resolve("buffer/"),
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "dev-page/index.html", // Utiliser un nom différent pour la nouvelle page
      template: __dirname + "/dev-page/index.html",
      inject: false,
      templateParameters: (compilation, assets) => {
        const css = assets.css
          .map((filePath) => `<link rel="stylesheet" href="${filePath}" />`)
          .join("\n");
        const js = assets.js
          .map((filePath) => `<script src="${filePath}"></script>`)
          .join("\n");
        return { css, js };
      },
    }),

    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: __dirname + "/dev-page",
          to: "dev-page",
          globOptions: {
            ignore: ["**/index.html"], // Assure-toi de ne pas copier ces fichiers déjà générés
          },
        },
      ],
    }),

    // so that JQuery is automatically inserted
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, "./dev-page"),
    },
    historyApiFallback: true,
    hot: true,
    open: ["/dev-page"],
  },
  devtool: "source-map",
};
