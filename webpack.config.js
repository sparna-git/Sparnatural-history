const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");

const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  entry: {
    "sparnatural-history": [
      "./src/SparnaturalHistoryElement.ts",
      "./scss/sparnatural-history.scss",
    ],
  },
  output: {
    path: path.resolve(__dirname, "./dist/browser"),
    filename: "[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
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
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { sourceMap: true },
          },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                includePaths: ["node_modules"],
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8000,
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
      stream: require.resolve("stream-browserify"),
      process: require.resolve("process/browser"),
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "dev-page/index.html",
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
            ignore: ["**/index.html"],
          },
        },
      ],
    }),

    // uncomment to analyze the package size
    //new StatoscopeWebpackPlugin(),

    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
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
