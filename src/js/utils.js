export function copyTextFromInput(input, copyBtn) {
	const inputValue = input.innerText;

	if (inputValue !== '') {
		navigator.clipboard.writeText(inputValue);
		copyBtn.setAttribute('href', './img/sprite.svg#check');
		setTimeout(() => {
			copyBtn.removeAttribute('href', './img/sprite.svg#check');
		}, 350);
	}
}

export function downloadFile(filename, data) {
	const blob = new Blob([data], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();

	URL.revokeObjectURL(url);
}

export async function handleTextFiles(files, fileCallback) {
	const promises = [...files].map(fileCallback);
	await Promise.all(promises);
}

export async function handleDrop(e, dropCallback) {
	e.preventDefault();
	let dt = e.dataTransfer;
	let files = dt.files;

	dropCallback(files);
}

export function formatPair(username, uuid, format) {
	if (format === 'json') {
		return { uuid, name: username };
	}
	return `${username} - ${uuid}`;
}

export function formatOutputCode(pairs, format) {
	if (format === 'json') {
		return JSON.stringify(pairs, null, 2);
	}
	return pairs.join('\n');
}

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

export function parseUsernames(inputValue) {
	return inputValue
		.split('\n')
		.map((username) => username.trim())
		.filter((username) => username.length > 0);
}

export function areArraysEqual(a, b) {
	if (a === b) return true;

	if (a == null || b == null) return false;

	if (a.length !== b.length) return false;

	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}

	return true;
}
