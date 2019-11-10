const path = require('path');
const { version } = require('./package.json');

module.exports = env => ({
	entry: './src/Polar.ts',
	mode: env === 'dev' ? 'development' : 'production',
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
		filename: env === 'dev' ? 'polar.min.js' : `discord.${version}.js`,
		path: path.resolve(__dirname, env === 'dev' ? 'tests' : 'umd',),
		library: 'Polar',
		libraryTarget: 'window'
	},
	watch: env === dev ? true : false
});