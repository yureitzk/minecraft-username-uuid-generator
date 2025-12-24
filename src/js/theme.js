/**
 * @param {MouseEvent} e
 */
export const toggleColorMode = (e) => {
	const target = /** @type {HTMLElement} */ (e.currentTarget);
	if (!target) return;

	// Switch to Light Mode
	if (target.classList.contains('light--hidden')) {
		// Sets the custom HTML attribute
		document.documentElement.setAttribute('color-mode', 'light');

		// Sets the user's preference in local storage
		localStorage.setItem('color-mode', 'light');
		return;
	}

	/* Switch to Dark Mode
        Sets the custom HTML attribute */
	document.documentElement.setAttribute('color-mode', 'dark');

	// Sets the user's preference in local storage
	localStorage.setItem('color-mode', 'dark');
};

export const initializeColorMode = () => {
	const savedMode = localStorage.getItem('color-mode');
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	const colorMode = savedMode || (prefersDark ? 'dark' : 'light');

	document.documentElement.setAttribute('color-mode', colorMode);
};
