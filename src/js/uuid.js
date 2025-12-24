import MD5 from 'crypto-js/md5';

/**
 * @param {string} name
 * @returns {string}
 * @throws {TypeError}
 */
function createUUID(name) {
	if (typeof name !== 'string') {
		throw new TypeError("'name' should be a string!");
	}
	const input = 'OfflinePlayer:' + name;
	const hash = MD5(input);
	// https://www.rfc-editor.org/rfc/rfc4122#section-4.3
	const byteArray = new Uint8Array(16);
	for (let i = 0; i < 16; i++) {
		byteArray[i] = (hash.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	}
	byteArray[6] = (byteArray[6] & 0x0f) | 0x30;
	byteArray[8] = (byteArray[8] & 0x3f) | 0x80;
	return formatUUID(byteArray);
}

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function formatUUID(bytes) {
	const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0'));
	return [
		hex.slice(0, 4).join(''),
		hex.slice(4, 6).join(''),
		hex.slice(6, 8).join(''),
		hex.slice(8, 10).join(''),
		hex.slice(10, 16).join(''),
	].join('-');
}

export default createUUID;
