import './sass/style.scss';

import { registerSW } from 'virtual:pwa-register';
import { toggleColorMode, initializeColorMode } from './js/theme.js';
import {
	copyTextFromInput,
	downloadFile,
	handleDrop,
	handleTextFiles,
	formatOutputCode,
	generateTimestamp,
	areArraysEqual,
	formatPair,
} from './js/utils.js';
import { generateOnlineMappings, generateOfflineMappings } from './js/generator.js';
import { createMessageElement, removeMessageElement } from './js/message.js';

const highlightWorker = new Worker(new URL('./js/highlightWorker.js', import.meta.url), { type: 'module' });

/**
 * @typedef {import('./types/global').Elements} Elements
 * @typedef {import('./types/global').ExportFormat} ExportFormat
 * @typedef {import('./types/global').ImportType} ImportType
 */

class UUIDGenerator {
	constructor() {
		/** @type {Elements} */
		this.elements = this.initializeElements();
		this.setupWorker();
		/** @type {string[]} */
		this.usernames = [];
		/** @type {ImportType | ''} */
		this.type = '';
		/** @type {Map<string, string>} */
		this.cachedMappings = new Map();
	}

	/**
	 * @returns {Elements}
	 */
	initializeElements() {
		return {
			generateButton: document.querySelector('.form__button'),
			input: document.querySelector('.form__input'),
			inputTypeGroup: document.querySelector('.form__radio-group--input'),
			resultWrapper: document.querySelector('.form__result-wrapper'),
			result: document.querySelector('.form__result code'),
			loader: document.querySelector('.loading'),
			outputFormatGroup: document.querySelector('.form__radio-group--output'),
			copyButton: document.querySelector('.form-button--copy'),
			copyButtonIcon: document.querySelector('.form-button__icon--copy use'),
			downloadButton: document.querySelector('.form-button--download'),
			fileInput: document.querySelector('.form__uploader'),
			colorModeButtons: document.querySelectorAll('.color-mode-button'),
		};
	}

	setupWorker() {
		highlightWorker.onmessage = (event) => {
			this.updateResultDisplay(event.data);
		};
		highlightWorker.onerror = (error) => {
			console.error('Worker error:', error);
		};
	}

	/**
	 * @returns {ExportFormat}
	 */
	getExportFormat() {
		const checked = /** @type {HTMLInputElement | null} */ (this.elements.outputFormatGroup?.querySelector('input[name="export"]:checked'));
		return /** @type {ExportFormat} */ (checked?.value || 'json');
	}

	/**
	 * @returns {ImportType}
	 */
	getImportType() {
		const checked = /** @type {HTMLInputElement | null} */ (this.elements.inputTypeGroup?.querySelector('input[name="import"]:checked'));
		return /** @type {ImportType} */ (checked?.value || 'online');
	}

	/**
	 * @returns {string[]}
	 */
	getUsernames() {
		return (this.elements.input?.value || '')
			.split('\n')
			.map((username) => username.trim())
			.filter((username) => username.length > 0);
	}

	/**
	 * @param {boolean} show
	 */
	toggleLoader(show) {
		const action = show ? 'add' : 'remove';
		this.elements.resultWrapper?.classList[action]('form__result-wrapper--loading');
		this.elements.loader?.classList[action]('loading--visible');
	}

	/**
	 * @param {boolean} highlight
	 */
	toggleInputHighlight(highlight) {
		const action = highlight ? 'add' : 'remove';
		this.elements.input?.classList[action]('form__input--highlight');
	}

	/**
	 * @param {string} code
	 * @param {string} language
	 */
	displayHighlightedCode(code, language) {
		highlightWorker.postMessage({ code, language });
	}

	/**
	 * @param {string} highlightedCode
	 */
	updateResultDisplay(highlightedCode) {
		if (!this.elements.result) return;

		const isJson = this.getExportFormat() === 'json';
		this.elements.result.innerHTML = highlightedCode;
		this.elements.result.classList.add('hljs');
		this.elements.result.classList.toggle('language-json', isJson);
		this.elements.result.classList.toggle('language-uuid-pairs', !isJson);
	}

	showErrorMessage() {
		const messageBox = createMessageElement();
		removeMessageElement(messageBox);
	}

	/**
	 * @returns {Promise<void>}
	 */
	async generatePairs() {
		const usernames = this.getUsernames();
		if (usernames.length === 0) return;

		const format = this.getExportFormat();
		const type = this.getImportType();

		const needsRefetch = type !== this.type || !areArraysEqual(usernames, this.usernames);

		if (needsRefetch) {
			await this.fetchMappings(usernames, type);
		}

		if (this.cachedMappings.size > 0) {
			this.renderMappings(format);
		}
	}

	/**
	 * @param {ExportFormat} format
	 */
	renderMappings(format) {
		const formattedPairs = Array.from(this.cachedMappings.entries()).map(([username, uuid]) => formatPair(username, uuid, format));
		const code = formatOutputCode(formattedPairs, format);
		const language = format === 'json' ? 'json' : 'uuid-pairs';
		this.displayHighlightedCode(code, language);
	}

	/**
	 * @param {string[]} usernames
	 * @param {ImportType} type
	 * @returns {Promise<void>}
	 */
	async fetchMappings(usernames, type) {
		this.usernames = usernames;
		this.type = type;
		const isOnline = type === 'online';

		if (isOnline) this.toggleLoader(true);

		const result = isOnline ? await generateOnlineMappings(this.usernames) : generateOfflineMappings(this.usernames);

		const settled = await Promise.allSettled(result.promises);
		const hasErrors = settled.some((r) => r.status === 'rejected');

		if (hasErrors) this.showErrorMessage();
		if (isOnline) this.toggleLoader(false);
		if (result.mappings.length === 0) return;

		this.cachedMappings.clear();
		const mappingLookup = new Map(result.mappings.filter((m) => m?.name && m?.uuid).map((m) => [m.name, m.uuid]));

		this.usernames.forEach((username) => {
			const uuid = mappingLookup.get(username);
			if (uuid) {
				this.cachedMappings.set(username, uuid);
			}
		});
	}

	/**
	 * @param {File} file
	 * @returns {Promise<void>}
	 */
	async updateInputFromFile(file) {
		if (!this.elements.input) return;

		const text = await file.text();
		const currentValue = this.elements.input.value;
		const existing = new Set(this.getUsernames());
		const newUsernames = text
			.split('\n')
			.map((u) => u.trim())
			.filter((u) => u && !existing.has(u));

		if (newUsernames.length > 0) {
			this.elements.input.value = currentValue ? `${currentValue}\n${newUsernames.join('\n')}` : newUsernames.join('\n');
		}
	}

	/**
	 * @param {FileList} files
	 * @returns {Promise<void>}
	 */
	async handleFileUpload(files) {
		await handleTextFiles(files, (file) => this.updateInputFromFile(file));
		await this.generatePairs();
	}

	handleDownload() {
		const content = this.elements.result?.innerText;
		if (!content) return;

		const timestamp = generateTimestamp();
		const format = this.getExportFormat();
		const filename = `uuid-${timestamp}.${format}`;

		downloadFile(filename, content);
	}

	setupEventListeners() {
		this.elements.generateButton?.addEventListener('click', () => this.generatePairs());

		this.elements.outputFormatGroup?.querySelectorAll('input').forEach((input) => {
			input?.addEventListener('change', () => this.generatePairs());
		});

		this.elements.copyButton?.addEventListener('click', () => {
			if (this.elements.result && this.elements.copyButtonIcon) {
				copyTextFromInput(this.elements.result, this.elements.copyButtonIcon);
			}
		});

		this.elements.downloadButton?.addEventListener('click', () => this.handleDownload());

		this.elements.fileInput?.addEventListener('change', async (e) => {
			const target = /** @type {HTMLInputElement} */ (e.target);
			if (target?.files) {
				await this.handleFileUpload(target.files);
			}
		});

		['dragenter', 'dragover'].forEach((eventType) => {
			this.elements.input?.addEventListener(eventType, () => this.toggleInputHighlight(true), false);
		});

		['dragleave', 'drop'].forEach((eventType) => {
			this.elements.input?.addEventListener(eventType, () => this.toggleInputHighlight(false), false);
		});

		this.elements.input?.addEventListener(
			'drop',
			(e) => {
				handleDrop(e, (files) => this.handleFileUpload(files));
			},
			false,
		);

		this.elements.colorModeButtons?.forEach((btn) => {
			btn?.addEventListener('click', toggleColorMode);
		});
	}

	init() {
		initializeColorMode();
		this.setupEventListeners();
		registerSW({ immediate: true });
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const app = new UUIDGenerator();
	app.init();
});
