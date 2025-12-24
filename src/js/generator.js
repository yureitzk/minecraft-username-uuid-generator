import pLimit from 'p-limit';
import { getUUID } from './api.js';
import createUUID from './uuid.js';

/**
 * @typedef {import('../types/global').MappingResult} MappingResult
 * @typedef {import('../types/global').UUIDMapping} UUIDMapping
 */

/**
 * @param {string[]} usernames
 * @returns {Promise<MappingResult>}
 */
export async function generateOnlineMappings(usernames) {
	const limit = pLimit(10);
	/** @type {UUIDMapping[]} */
	const mappings = [];

	const promises = usernames.map((username) =>
		limit(async () => {
			const uuid = await getUUID(username);
			mappings.push({ name: username, uuid });
		}),
	);

	return { promises, mappings };
}

/**
 * @param {string[]} usernames
 * @returns {MappingResult}
 */
export function generateOfflineMappings(usernames) {
	/** @type {UUIDMapping[]} */
	const mappings = [];
	const promises = usernames.map((username) => {
		try {
			const uuid = createUUID(username);
			mappings.push({ name: username, uuid });
			return Promise.resolve();
		} catch (err) {
			return Promise.reject(err);
		}
	});

	return { promises, mappings };
}
