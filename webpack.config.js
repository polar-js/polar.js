const path = require('path');

module.exports = {
    entry: './src/Polar.ts',
    mode: 'development',
    watch: true,
    module: {
        rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }
    ]
    },
        resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'polar.min.js',
        path: path.resolve(__dirname, 'tests'),
        library: 'Polar',
        libraryTarget: 'window',
    }
};