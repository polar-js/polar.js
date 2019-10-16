const webpack = require('webpack');
const TypeDoc = require('typedoc');
const path = require('path');

const { version } = require('./package.json');
const mode = process.argv[2] || 'dev';

if (mode !== 'dev' && mode !== 'prod') throw new Error('Invalid mode, please choose dev or prod');

console.log(`Generating for v${version} of Polar Engine in ${mode} mode`);

console.log('Webpack: configuring');
const compiler = webpack({
	entry: './src/Polar.ts',
	mode: 'development',
	watch: true,
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
		path: path.resolve(__dirname, 'tests'),
		library: 'Polar',
		libraryTarget: 'window'
	}
});

function handleCompile(err, stats) {
	if (err)
		console.log(`Webpack: error, something catastrophic happened\n${err}`);
	else if (stats.hasErrors() || stats.hasWarnings()) 
		console.log('Webpack: compiled with errors and/or warnings');
	else 
		console.log('Webpack: compiled successfully');
}

if (mode === 'dev') {
	console.log('Webpack: watching for file changes...');
	compiler.watch({}, handleCompile);
}

console.log('TypeDoc: configuring');
const app = new TypeDoc.Application({
	mode:   'Modules',
	logger: 'none',
	target: 'ES5',
	module: 'CommonJS',
	experimentalDecorators: true
});

if (mode === 'prod') {
	console.log('Webpack: generating once');
	compiler.run(handleCompile);

	console.log('TypeDoc: generating docs');
	const project = app.convert(app.expandInputFiles(['src']));
	if (project) {
		console.log('TypeDoc: generated succesfully');
		const outputDir = 'docs';
		app.generateDocs(project, 'docs');
		app.generateJson(project, 'docs/documentation.json');
	} else {
		console.log('TypeDoc: error, something went wrong');
	}
}
