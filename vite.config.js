import { defineConfig } from 'vite';
import { resolve, relative, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';
import glob from 'fast-glob';
import cssnano from 'cssnano';
import viteImagemin from 'vite-plugin-imagemin';
import handlebars from 'vite-plugin-handlebars';
import viteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';
import pkg from './package.json';

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');
export default defineConfig({
	root,
	css: {
		postcss: {
			plugins: [
				cssnano({
					preset: ['default', { discardComments: { removeAll: true } }],
				}),
			],
		},
	},
	resolve: {
		alias: [
			{
				find: /~(.+)/,
				replacement: join(process.cwd(), 'node_modules/$1'),
			},

			{
				find: /@\//,
				replacement: join(process.cwd(), './src/renderer') + '/',
			},
		],
	},
	plugins: [
		viteSvgSpriteWrapper({
			icons: './src/img/svg/*.svg',
			outputDir: './src/img',
			sprite: {
				svg: {
					dimensionAttributes: false,
				},
			},
		}),
		VitePWA({
			workbox: {
				globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,woff2}'],
				navigateFallback: 'index.html',
			},
			includeAssets: ['fonts/*.woff2', '*.png', 'img/*.svg'],
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true,
				suppressWarnings: true,
			},
			manifest: {
				name: pkg.displayName,
				short_name: 'UUID Generator',
				theme_color: '#c6c6c6',
				background_color: '#c7c7c7',
				display: 'standalone',
				start_url: '/',
				description: pkg.description,
				orientation: 'any',
				icons: [
					{
						src: './favicon-32x32.png',
						sizes: '32x32',
					},
					{
						src: './favicon-48x48.png',
						sizes: '48x48',
					},
					{
						src: './favicon-192x192.png',
						sizes: '192x192',
					},
					{
						src: './favicon-167x167.png',
						sizes: '167x167',
						purpose: 'maskable',
					},
					{
						src: './favicon-180x180.png',
						sizes: '180x180',
					},
					{
						src: './favicon-512x512.png',
						sizes: '512x512',
					},
				],
			},
		}),
		handlebars({
			partialDirectory: resolve(__dirname, 'src/parts'),
		}),
		viteImagemin({
			gifsicle: {
				optimizationLevel: 7,
				interlaced: false,
			},
			optipng: {
				optimizationLevel: 7,
			},
			mozjpeg: {
				quality: 20,
			},
			pngquant: {
				quality: [0.8, 0.9],
				speed: 4,
			},
			svgo: {
				plugins: [
					{
						name: 'removeViewBox',
					},
					{
						name: 'removeEmptyAttrs',
						active: false,
					},
				],
			},
		}),
	],
	build: {
		outDir,
		emptyOutDir: true,
		rollupOptions: {
			input: Object.fromEntries(
				glob.sync(['./src/*.html', './src/**/*.html', '!./src/parts/**']).map((file) => [
					// This remove `src/` as well as the file extension from each
					// file, so e.g. src/nested/foo.html becomes nested/foo
					relative(__dirname, file.slice(0, file.length - extname(file).length)),
					// This expands the relative paths to absolute paths, so e.g.
					// src/nested/foo becomes /project/src/nested/fo.js
					fileURLToPath(new URL(file, import.meta.url)),
				]),
			),
			output: {
				chunkFileNames: 'js/[name]-[hash].js',
				entryFileNames: 'js/[name]-[hash].js',

				assetFileNames: ({ name }) => {
					if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
						return 'img/[name]-[hash][extname]';
					}

					if (/\.css$/.test(name ?? '')) {
						return 'css/[name]-[hash][extname]';
					}

					// default value
					// ref: https://rollupjs.org/guide/en/#outputassetfilenames
					return 'assets/[name]-[hash][extname]';
				},
			},
		},
	},
});
