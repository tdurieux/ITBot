module.exports = {
    entry: './src/program.ts',
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