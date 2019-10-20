const webpack = require('webpack');
const TypeDoc = require('typedoc');
const path = require('path');

const { version } = require('./package.json');
const mode = process.argv[2] || 'watch';

/*
 prod: npm js and declaration in dist/ + minified webpack in umd/
 watch: For development, watches for file changes and generates webpack into /tests
*/

if (mode !== 'prod' && mode !== 'watch') throw new Error('Invalid mode, please choose prod or watch');

console.log(`Generating for v${version} of Polar Engine in ${mode} mode`);

console.log('Configuring webpack');
const compiler = webpack({
	entry: './src/Polar.ts',
	mode: mode === 'watch' ? 'development' : 'production',
	watch: mode === 'watch' ? true : false,
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
		filename: 'polar.min.js',
		path: path.resolve(__dirname, mode === 'watch' ? 'tests' : 'umd',),
		library: 'Polar',
		libraryTarget: 'window'
	}
});

function handleCompile(err, stats) {
	if (err)
		console.log(`Webpack error, something catastrophic happened\n${err}`);
	else if (stats.hasErrors() || stats.hasWarnings()) {
		console.log(`Webpack compiled with${stats.hasErrors() ? 'some' : ' no'} errors and${stats.hasWarnings() ? 'some' : ' no'} warnings.`);
		console.log(stats.toString());
	} else 
		console.log('Webpack compiled successfully');
}

if (mode === 'watch') {
	console.log('Webpack now watching for file changes...');
	compiler.watch({}, handleCompile);
} else {
	console.log('Configuring TypeDoc');
	const app = new TypeDoc.Application({
		mode:   'Modules',
		logger: 'none',
		target: 'ES6',
		module: 'CommonJS',
		experimentalDecorators: true
	});

	console.log('Building webpack');
	compiler.run(handleCompile);

	console.log('Building docs');
	const project = app.convert(app.expandInputFiles(['src']));
	if (project) {
		console.log('TypeDoc built successfully');
		app.generateDocs(project, 'docs');
		app.generateJson(project, 'docs/documentation.json');
	} else {
		console.log('TypeDoc had an error');
	}
}

