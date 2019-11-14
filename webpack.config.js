const path = require('path');
const { version } = require('./package.json');

module.exports = env => ({
	entry: './src/Polar.ts',
	mode: env.production ? 'production' : 'development',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}
		]
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ],
		alias: {
			Polar: path.resolve(__dirname, 'src/Polar')
		}
	},
	output: {
		filename: env === 'dev' ? 'polar.min.js' : `polar.${env.production ? version : 'min'}.js`,
		path: path.resolve(__dirname, env.production ? 'umd' : 'tests',),
		library: 'Polar',
		libraryTarget: 'window'
	},
	watch: env.production ? false : true,
});