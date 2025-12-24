/**
 * @param {HTMLElement} input
 * @param {SVGUseElement} copyBtn
 * @returns {void}
 */
export function copyTextFromInput(input, copyBtn) {
	const inputValue = input.innerText;
	if (inputValue !== '') {
		navigator.clipboard.writeText(inputValue);
		copyBtn.setAttribute('href', './img/sprite.svg#check');
		setTimeout(() => {
			copyBtn.removeAttribute('href');
		}, 350);
	}
}

/**
 * @param {string} filename
 * @param {string} data
 * @returns {void}
 */
export function downloadFile(filename, data) {
	const blob = new Blob([data], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

/**
 * @param {FileList | File[]} files
 * @param {(file: File) => Promise<void>} fileCallback
 * @returns {Promise<void>}
 */
export async function handleTextFiles(files, fileCallback) {
	const promises = [...files].map(fileCallback);
	await Promise.all(promises);
}

/**
 * @param {DragEvent} e
 * @param {(files: FileList) => void} dropCallback
 * @returns {Promise<void>}
 */
export async function handleDrop(e, dropCallback) {
	e.preventDefault();
	let dt = e.dataTransfer;
	if (!dt) return;
	let files = dt.files;
	dropCallback(files);
}

/**
 * @param {string} username
 * @param {string} uuid
 * @param {string} format
 * @returns {{uuid: string, name: string} | string}
 */
export function formatPair(username, uuid, format) {
	if (format === 'json') {
		return { uuid, name: username };
	}
	return `${username} - ${uuid}`;
}

/**
 * @param {Array<{uuid: string, name: string} | string>} pairs
 * @param {string} format
 * @returns {string}
 */
export function formatOutputCode(pairs, format) {
	if (format === 'json') {
		return JSON.stringify(pairs, null, 2);
	}
	return pairs.join('\n');
}

/**
 * @returns {string}
 */
export function generateTimestamp() {
	const now = new Date();
	return [
		now.getFullYear(),
		String(now.getDate()).padStart(2, '0'),
		String(now.getMonth() + 1).padStart(2, '0'),
		String(now.getHours()).padStart(2, '0'),
		String(now.getMinutes()).padStart(2, '0'),
		String(now.getSeconds()).padStart(2, '0'),
	].join('-');
}

/**
 * @param {string} inputValue
 * @returns {string[]}
 */
export function parseUsernames(inputValue) {
	return inputValue
		.split('\n')
		.map((username) => username.trim())
		.filter((username) => username.length > 0);
}

/**
 * @template T
 * @param {T[]} a
 * @param {T[]} b
 * @returns {boolean}
 */
export function areArraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
