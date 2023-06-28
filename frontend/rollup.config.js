import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { extname } from 'path';
import { defineConfig } from 'rollup';
import esbuild, { minify } from 'rollup-plugin-esbuild';

import { getRoot, jkmx } from './build.js';

const ROOT = getRoot();

export default Promise.resolve().then(() => defineConfig({
	input: {
		index: './src/index.tsx',
	},
	plugins: [
		commonjs(),
		nodeResolve(),
		replace({
			preventAssignment: true,
			values: {
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			},
		}),
		esbuild({
			exclude: [],
			jsx: 'transform',
			jsxFactory: 'createElement',
			jsxFragment: 'Fragment',
			loaders: { '.js': false },
			target: 'esnext',
		}),
		new jkmx,
	],
	output: {
		assetFileNames: assetInfo => {
			switch (extname(assetInfo.name)) {
				case '.ttf': return 'fonts/[name][extname]';
				case '.jpg':
				case '.png': return 'images/[name][extname]';
				default: return 'assets/[name][extname]';
			}
		},
		// chunkFileNames: 'js/[name].[hash].js',
		chunkFileNames: 'js/[name].js',
		compact: process.env.NODE_ENV === 'production',
		dir: './dist',
		// entryFileNames: 'js/[name].[hash].js',
		entryFileNames: 'js/[name].js',
		format: 'es',
		generatedCode: 'es2015',
		minifyInternalExports: false,
		plugins: [
			process.env.NODE_ENV === 'production' && minify({
				charset: 'utf8',
				legalComments: 'none',
				treeShaking: true,
			})
		],
		sourcemap: true,
	}
}));
