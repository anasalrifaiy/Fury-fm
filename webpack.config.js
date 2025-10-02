const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.web.js',
  experiments: {
    outputModule: false,
  },
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      'react-native-vector-icons/MaterialCommunityIcons': path.resolve(__dirname, 'src/web-mocks/react-native-vector-icons.js'),
      '@react-native-firebase/auth': path.resolve(__dirname, 'src/web-mocks/firebase-auth.js'),
      '@react-native-firebase/firestore': path.resolve(__dirname, 'src/web-mocks/firebase-firestore.js'),
      '@react-native-firebase/storage': path.resolve(__dirname, 'src/web-mocks/firebase-firestore.js'),
      '@react-native-firebase/database': path.resolve(__dirname, 'src/web-mocks/firebase-firestore.js'),
      'react-native-image-picker': path.resolve(__dirname, 'src/web-mocks/react-native-vector-icons.js'),
      '@react-native-community/masked-view': path.resolve(__dirname, 'src/web-mocks/react-native-vector-icons.js'),
      'react-native-safe-area-context': path.resolve(__dirname, 'src/web-mocks/safe-area-context.js'),
      'react-native-screens': path.resolve(__dirname, 'src/web-mocks/react-native-vector-icons.js'),
      'react-native-gesture-handler': path.resolve(__dirname, 'src/web-mocks/gesture-handler.js'),
      '@react-navigation/native': path.resolve(__dirname, 'src/web-mocks/react-navigation-native.js'),
      '@react-navigation/stack': path.resolve(__dirname, 'src/web-mocks/react-navigation-stack.js'),
      '@react-navigation/bottom-tabs': path.resolve(__dirname, 'src/web-mocks/react-navigation-bottom-tabs.js'),
    },
    extensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx'],
    fallback: {
      "crypto": false,
      "stream": false,
      "buffer": false,
      "events": false
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!react-native|@react-native-firebase)/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: './babel.config.web.js'
          },
        },
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/',
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'web-build'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true,
    hot: false,
    liveReload: false,
    client: false,
  },

  // Suppress expected errors from React Native modules
  ignoreWarnings: [
    {
      module: /react-native\/Libraries\/Utilities\/binaryToBase64\.js/,
    },
    {
      module: /react-native\/Libraries\/vendor\/emitter\/EventEmitter\.js/,
    },
    {
      module: /@react-navigation\/elements\/lib\/module\/Header\/HeaderBackButton\.js/,
    },
    {
      module: /@react-navigation\/native\/lib\/module\/NavigationContainer\.js/,
    },
  ],

  // Filter out specific module resolution errors
  stats: {
    warningsFilter: [
      /Can't resolve '\.\/useBackButton'/,
      /Can't resolve '\.\/useDocumentTitle'/,
      /Can't resolve '\.\/useLinking'/,
      /Can't resolve '\.\.\/MaskedView'/,
      /Module parse failed.*binaryToBase64/,
      /Module parse failed.*EventEmitter/,
    ],
  },
};