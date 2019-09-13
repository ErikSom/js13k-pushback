import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

module.exports = {
	input: 'src/game.js',
	output: {
		file: 'dist/g.js',
		format: 'iife',
		strict: false,
	},
	plugins: [
		babel(),
		terser(),
	],
};