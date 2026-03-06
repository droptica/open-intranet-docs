export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Strip /docs prefix if present (when accessed via route on main domain)
		if (url.pathname.startsWith('/docs')) {
			const newPath = url.pathname.replace(/^\/docs/, '') || '/';
			url.pathname = newPath;
		}

		return env.ASSETS.fetch(new Request(url, request));
	},
};
