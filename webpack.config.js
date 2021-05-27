module.exports = {
    entry: './src/cli.ts',
    target: 'node',
    output: {
        filename: 'dist/browserbot.js',
        path: __dirname
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
  };