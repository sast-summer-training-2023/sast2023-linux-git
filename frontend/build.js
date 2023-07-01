import assert from 'assert';
import { transform } from 'esbuild';
import { readFileSync } from 'fs';
import { cp, unlink } from 'fs/promises';
import MagicString, { Bundle, SourceMap } from 'magic-string';
import { basename, dirname, join, relative, resolve } from 'path';
import { rollup } from 'rollup';
import { batchWarnings } from 'rollup/dist/shared/loadConfigFile.js';
import { collapseSourcemap, decodedSourcemap, handleError, mergeOptions } from 'rollup/dist/shared/rollup.js';
import { fileURLToPath } from 'url';
import { inspect } from 'util';

import Config from './rollup.config.js';

const ROOT = getRoot();

export function getRoot() {
	return dirname(fileURLToPath(import.meta.url));
}

async function initStaticResources() {
	async function allowENOENT(promise) {
		try {
			return await promise;
		} catch (e) {
			if (e.code !== 'ENOENT') throw e;
			return e;
		}
	}
	const
		from = resolve(ROOT, 'public'),
		to = resolve(ROOT, 'dist'),
		links = ['src'];
	// clear symbolic lnks
	await Promise.all(links.map(name => allowENOENT(unlink(resolve(to, name)))));
	// copy public -> dist
	await cp(from, to, { recursive: true, verbatimSymlinks: true });
}

function updateSourceMap(sourceMap, absoluteDirName) {
	const { sources, sourcesContent } = sourceMap;
	assert.equal(sources.length, sourcesContent.length);
	for (let i = 0; i < sourceMap.sources.length; ++i) {
		sources[i] = relative(ROOT, resolve(absoluteDirName, sources[i]));
		if (sources[i].startsWith('src/'))
			sourcesContent[i] = null;
	}
	sourceMap.sourceRoot = '/';
}

const codeMap = new Map();

export class jkmx {
	name = 'jkmx';

	transform(code, id) { // css
		if (id.endsWith('.css')) {
			codeMap.set(id, code);
			return { code: 'export default import.meta.jkmx;' };
		}
		return null;
	}

	resolveImportMeta(property) { // css
		if (property === 'env') {
			return `({ MODE: ${JSON.stringify(process.env.NODE_ENV)} })`;
		}
		return null;
	}

	async generateBundle(_, bundle) { // css
		for (const chunkName in bundle) {
			const chunk = bundle[chunkName];
			if (chunk.type !== 'chunk') continue;

			const css = [
				...new Set(
					Object.keys(chunk.modules).flatMap(moduleName =>
						this.getModuleInfo(moduleName).importedIds.filter(moduleName =>
							moduleName.endsWith('.css')
						)
					)
				)
			].sort();
			if (!css.length) continue;

			const mergedBundle = new Bundle();
			for (const file of css) {
				const
					source = codeMap.get(file),
					content = new MagicString(source);
				for (const { 1: match, indices: { 1: [l, r] } } of source.matchAll(/\burl\((.+?)\)/dg)) {
					const url = resolve(dirname(file), match);
					const id = this.emitFile({
						name: basename(match),
						source: readFileSync(url),
						type: 'asset',
					});
					const fn = this.getFileName(id);
					const replacement = join('..', fn);
					content.update(l, r, replacement);
				}
				mergedBundle.addSource({
					filename: file,
					content,
					ignoreList: file.includes('node_modules'),
				});
			}

			const source = mergedBundle.toString();
			let code = source, map, sourceMap;

			if (process.env.NODE_ENV === 'production') {
				({ code, map } = await transform(source, {
					loader: 'css',
					sourcemap: true,
					charset: 'utf8',
					legalComments: 'none',
					treeShaking: true,
					minify: true,
				}));
			}

			const
				// hash = createHash('sha256').update(code).digest('hex').slice(0, 8),
				// fileName = `css/${chunk.name}.${hash}.css`,
				fileName = `css/${chunk.name}.css`,
				absoluteFileName = resolve(ROOT, fileName),
				sourceMapRaw = mergedBundle.generateDecodedMap({
					file: absoluteFileName,
					hires: true,
					includeContent: true
				});

			if (process.env.NODE_ENV === 'production') {
				// compose source-map
				const fullMapping = collapseSourcemap(
					absoluteFileName,
					source,
					sourceMapRaw,
					[decodedSourcemap(map)],
					warning => {
						debugger;
					}
				);
				sourceMap = new SourceMap(fullMapping);
			} else {
				sourceMap = new SourceMap(sourceMapRaw);
			}

			this.emitFile({
				fileName,
				source: `${code}/*# sourceMa` + `ppingURL=${basename(fileName)}.map */`,
				type: 'asset',
			});
			updateSourceMap(sourceMap, dirname(absoluteFileName));
			this.emitFile({
				fileName: `${fileName}.map`,
				source: sourceMap.toString(),
				type: 'asset',
			});

			chunk.imports.push(fileName);
		}
	}

	jkmx$updateChunkMap(sourceMap, fileName) { // source-map
		updateSourceMap(sourceMap, dirname(fileName));
	}
};

async function build() {
	const warnings = batchWarnings({});
	try {
		return await rollup(await mergeOptions(await Config, {}, warnings.add));
	} catch (e) {
		warnings.flush();
		handleError(e);
		throw '';
	}
}

async function emit(bundle) {
	await bundle.write((await Config).output);
	if (bundle) {
		await bundle.close();
	}
}

if (process.argv.length > 1 && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		if (!['development', 'production'].includes(process.env.NODE_ENV)) {
			throw new Error(`Please specify compile environment (NODE_ENV): expected \x1b[33m'development'\x1b[0m/\x1b[33m'production'\x1b[0m, found ${inspect(process.env.NODE_ENV, { colors: true })})`);
		}
		const t0 = process.uptime();
		console.log('\n\x1b[36mCopying static resources ...\x1b[0m\n');
		await initStaticResources();
		console.log(`\x1b[36mBuilding (\x1b[32m'${process.env.NODE_ENV}'\x1b[36m mode) ...\x1b[0m\n`);
		const result = await build();
		console.log('\n\x1b[36mEmitting ...\x1b[0m\n');
		await emit(result);
		console.log(`\x1b[32mFinished in \x1b[33m${process.uptime() - t0}\x1b[32m s !`);
	} catch (e) {
		console.log(e);
	}
}
