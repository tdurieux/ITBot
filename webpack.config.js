module.exports = {
    entry: './src/main.ts',
    target: 'node',
    output: {
        filename: 'dist/nap.js',
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