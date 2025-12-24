import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
	js.configs.recommended,
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
		ignores: ['dist/', 'node_modules/', '*.config.js', 'src/dev-dist/'],
	},
];
