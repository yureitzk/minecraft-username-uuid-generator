import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import { jsdoc } from 'eslint-plugin-jsdoc';

export default [
	js.configs.recommended,
	jsdoc({
		config: 'flat/recommended',
		rules: {
			'jsdoc/require-param-description': 'off',
			'jsdoc/require-returns-description': 'off',
		},
	}),
	prettier,
	{
		rules: {
			'no-unused-vars': 'warn',
			'no-undef': 'warn',
		},
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
			},
		},
	},
	{
		ignores: ['dist/', 'node_modules/', '*.config.js', 'src/dev-dist/', 'out/'],
	},
];
