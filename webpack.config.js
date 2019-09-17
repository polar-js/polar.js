const path = require('path');

module.exports = {
    entry: './src/Polar.ts',
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
        filename: 'polarbundle.js',
        path: path.resolve(__dirname, 'tests')
    }
};  