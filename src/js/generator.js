import pLimit from 'p-limit';
import { getUUID } from './api.js';
import createUUID from './uuid.js';

export async function generateOnlineMappings(usernames) {
	const limit = pLimit(10);
	const mappings = [];

	const promises = usernames.map((username) =>
		limit(async () => {
			const uuid = await getUUID(username);
			mappings.push({ name: username, uuid });
		}),
	);

	return { promises, mappings };
}

export function generateOfflineMappings(usernames) {
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
