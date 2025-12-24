import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('json', json);

hljs.registerLanguage('uuid-pairs', function () {
	return {
		contains: [
			{
				begin: /^/,
				end: /$/,
				contains: [
					{
						className: 'attr',
						begin: /^/,
						end: /(?= - )/,
					},
					{
						className: 'comment',
						match: / - /,
					},
					{
						className: 'string',
						match: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
					},
				],
			},
		],
	};
});

self.onmessage = (event) => {
	const { code, language } = event.data;

	const result = hljs.highlight(code, { language });

	// Post the result back to the main thread
	self.postMessage(result.value);
};
