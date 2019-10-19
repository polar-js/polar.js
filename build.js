const webpack = require('webpack');
const TypeDoc = require('typedoc');
const path = require('path');

const { version } = require('./package.json');
const mode = process.argv[2] || 'watch';

/*
 docs: Generates the typescript docs into /docs dir
 umd: Generates the webpack code into /umd dir
 watch: For development, watches for file changes and generates webpack into /tests
*/

if (mode !== 'docs' && mode !== 'umd' && mode !== 'watch') throw new Error('Invalid mode, please choose docs, umd or watch');

console.log(`Generating for v${version} of Polar Engine in ${mode} mode`);

console.log('Webpack: configuring');
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
		console.log(`Webpack: error, something catastrophic happened\n${err}`);
	else if (stats.hasErrors() || stats.hasWarnings()) 
		console.log('Webpack: compiled with errors and/or warnings');
	else 
		console.log('Webpack: compiled successfully');
}

if (mode === 'watch') {
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

if (mode === 'umd') {
	console.log('Webpack: generating once');
	compiler.run(handleCompile);
}

if (mode === 'docs') {
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
